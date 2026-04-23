#!/usr/bin/env python3
"""
Automate Jazz "Choose Your Number" search and extract available numbers.

Usage examples:
  python jazz_number_scraper.py --required-number 786 --digits-scope "Last 3 Digits"
  python jazz_number_scraper.py --required-number 1234 --digits-scope "Last 4 Digits" --prefix 0301 --type GOLDEN --json-out results.json
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable, List, Optional

from playwright.sync_api import Locator, Page, TimeoutError as PlaywrightTimeoutError, sync_playwright


TARGET_URL = "https://jazz.com.pk/choose-your-number"
PHONE_PATTERN = re.compile(r"\b03\d{9}\b")


@dataclass(frozen=True)
class SearchConfig:
    mode: str
    required_number: str
    digits_scope: str
    number_type: Optional[str]
    prefix: Optional[str]
    timeout_ms: int
    headless: bool


@dataclass(frozen=True)
class NumberRecord:
    full_number: str
    prefix: str
    suffix: str


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Search Jazz 'Choose Your Number' and scrape available numbers."
    )
    parser.add_argument(
        "--mode",
        choices=["type", "searchCriteria"],
        default="searchCriteria",
        help="Which search mode to run on the site.",
    )
    parser.add_argument(
        "--required-number",
        required=False,
        help="Desired digits/pattern to search (e.g. 786, 1234).",
    )
    parser.add_argument(
        "--digits-scope",
        default="Last 3 Digits",
        choices=[
            "First 3 Digits",
            "First 4 Digits",
            "Middle 3 Digits",
            "Middle 4 Digits",
            "Last 3 Digits",
            "Last 4 Digits",
            "All 7 Digits",
        ],
        help="Search scope selector value shown on the website.",
    )
    parser.add_argument(
        "--type",
        dest="number_type",
        default=None,
        help='Optional number category from site (e.g. NORMAL, SILVER, GOLDEN).',
    )
    parser.add_argument(
        "--prefix",
        default=None,
        help="Optional prefix from site (e.g. 0300, 0301, ...).",
    )
    parser.add_argument(
        "--json-out",
        default=None,
        help="Optional output JSON file path.",
    )
    parser.add_argument(
        "--timeout-ms",
        type=int,
        default=30000,
        help="Playwright timeout in ms. Default: 30000",
    )
    parser.add_argument(
        "--show-browser",
        action="store_true",
        help="Run browser in headed mode for debugging.",
    )
    return parser


def normalize_required_number(value: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError("required number cannot be empty")
    if not re.fullmatch(r"\d{1,7}", normalized):
        raise ValueError("required number must contain only 1-7 digits")
    return normalized


def click_tab_if_present(page: Page, tab_name: str) -> None:
    """
    Jazz uses a tabbed UI (e.g. 'Search Criteria' and 'Type').
    This attempts to activate the requested tab without failing hard if the UI changes.
    """
    tab_lower = tab_name.strip().lower()
    candidates = [
        # Current Jazz implementation uses radio buttons.
        page.get_by_role(
            "radio",
            name=re.compile(
                r"^type$" if "type" in tab_lower else r"^search criteria$",
                re.IGNORECASE,
            ),
        ),
        page.locator(
            f"input[type='radio'][value={'prefix' if 'type' in tab_lower else 'searchcriteria'}]"
        ),
        page.get_by_role("button", name=re.compile(rf"^{re.escape(tab_name)}$", re.IGNORECASE)),
        page.get_by_role("button", name=re.compile(rf"{re.escape(tab_name)}", re.IGNORECASE)),
        page.locator(f"button:has-text('{tab_name}')"),
        page.locator(f"text={tab_name}"),
    ]
    for c in candidates:
        try:
            if c.count() == 0:
                continue
            c.first.click(timeout=1500)
            page.wait_for_timeout(250)
            return
        except PlaywrightTimeoutError:
            continue


def try_select_by_id(page: Page, select_id: str, desired_text: str) -> bool:
    select = page.locator(f"#{select_id}")
    if select.count() == 0:
        return False
    return try_select_by_visible_text(select.first, desired_text.strip().lower())


def set_prefix_and_type(page: Page, *, mode: str, prefix: Optional[str], number_type: Optional[str]) -> None:
    """
    Prefer stable select IDs (they exist on Jazz today), fallback to label-based matching.
    """
    if mode == "type":
        # Prefer selecting via the visible select2 UI (more reliable than hidden <select> mutations).
        if number_type:
            _ = select_select2_option(page, combobox_hint="type", option_text=number_type)
        if prefix:
            _ = select_select2_option(page, combobox_hint="prefix", option_text=prefix)

        # Type tab: type=<select id="type">, prefix=<select id="ndc_type">
        if number_type:
            if not try_select_by_id(page, "type", number_type):
                _ = select_dropdown_option_by_text(page, "type", number_type)
        if prefix:
            if not try_select_by_id(page, "ndc_type", prefix):
                _ = select_dropdown_option_by_text(page, "prefix", prefix)
        return

    # Search Criteria tab: prefix=<select id="ndc">
    if prefix:
        if not try_select_by_id(page, "ndc", prefix):
            _ = select_dropdown_option_by_text(page, "prefix", prefix)


def select_select2_option(page: Page, *, combobox_hint: str, option_text: str) -> bool:
    """
    Jazz renders selects using select2, exposing an ARIA combobox + listbox.
    Selecting through that UI is often the only reliable way in headless mode.
    """
    desired = option_text.strip()
    if not desired:
        return False

    # After switching to Type mode, there are exactly two comboboxes (Type then Prefix).
    combos = page.get_by_role("combobox").all()
    if not combos:
        return False

    idx = 0 if combobox_hint.lower() == "type" else 1
    if idx >= len(combos):
        idx = 0

    combo = combos[idx]
    try:
        combo.click(timeout=3000)
    except PlaywrightTimeoutError:
        return False

    # Prefer exact-ish match on the option text; for "GOLDEN" we accept the Jazz label.
    pattern = re.compile(rf"^{re.escape(desired)}$", re.IGNORECASE)
    option = page.get_by_role("option", name=pattern)
    if option.count() == 0:
        pattern2 = re.compile(re.escape(desired), re.IGNORECASE)
        option = page.get_by_role("option", name=pattern2)
    if option.count() == 0:
        # For types we pass "GOLDEN" etc; Jazz option is "GOLDEN Rs. 1,500"
        if combobox_hint.lower() == "type":
            option = page.get_by_role(
                "option", name=re.compile(rf"^{re.escape(desired)}\b", re.IGNORECASE)
            )
    if option.count() == 0:
        # Give up: close dropdown by hitting escape.
        try:
            page.keyboard.press("Escape")
        except Exception:
            pass
        return False

    try:
        option.first.click(timeout=3000)
        page.wait_for_timeout(200)
        return True
    except PlaywrightTimeoutError:
        return False


def select_dropdown_option_by_text(page: Page, label_fragment: str, option_text: str) -> bool:
    target_text = option_text.strip().lower()
    labels = page.locator("label").all()
    for label in labels:
        try:
            text = (label.inner_text() or "").strip().lower()
        except PlaywrightTimeoutError:
            continue
        if label_fragment.lower() not in text:
            continue
        select_id = label.get_attribute("for")
        if not select_id:
            continue
        select = page.locator(f"#{select_id}")
        if select.count() == 0:
            continue
        selected = try_select_by_visible_text(select, target_text)
        if selected:
            return True
    return False


def try_select_by_visible_text(select: Locator, desired_text_lower: str) -> bool:
    options = select.locator("option").all()
    for option in options:
        option_text = (option.inner_text() or "").strip().lower()
        if option_text == desired_text_lower:
            option_value = option.get_attribute("value")
            if option_value is None:
                continue
            set_select_value(select, option_value)
            return True
    return False


def set_select_value(select: Locator, option_value: str) -> None:
    """
    Jazz uses select2, where the underlying <select> is often hidden.
    Playwright's select_option requires the element to be visible; for hidden selects,
    set the value via JS and dispatch change events (select2 listens to these).
    """
    try:
        if select.is_visible() and select.is_enabled():
            select.select_option(value=option_value)
            return
    except PlaywrightTimeoutError:
        pass

    select.evaluate(
        """(el, value) => {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }""",
        option_value,
    )


def fill_required_number(page: Page, required_number: str) -> None:
    candidate_selectors = [
        "#pattern",
        'input[name="pattern"]',
        'input[placeholder*="Required Number" i]',
        'input[name*="required" i]',
        'input[id*="required" i]',
        'input[type="text"]',
    ]

    for selector in candidate_selectors:
        field = page.locator(selector).first
        if field.count() == 0:
            continue
        try:
            field.fill(required_number)
            if (field.input_value() or "").strip() == required_number:
                return
        except PlaywrightTimeoutError:
            continue
    raise RuntimeError("Could not locate the required number input field.")


def click_search(page: Page) -> None:
    button_candidates = [
        page.locator("#submit"),
        page.get_by_role("button", name=re.compile(r"search", re.IGNORECASE)),
        page.locator("button:has-text('Search')"),
        page.locator("input[type='submit']"),
    ]
    for btn in button_candidates:
        if btn.count() == 0:
            continue
        try:
            btn.first.click(timeout=3000)
            return
        except PlaywrightTimeoutError:
            continue
    raise RuntimeError("Search button was not found or not clickable.")


def extract_phone_numbers_from_text_blocks(text_blocks: Iterable[str]) -> List[NumberRecord]:
    unique = set()
    records: List[NumberRecord] = []
    for block in text_blocks:
        for match in PHONE_PATTERN.findall(block):
            if match in unique:
                continue
            unique.add(match)
            records.append(NumberRecord(full_number=match, prefix=match[:4], suffix=match[4:]))
    return records


def gather_results(page: Page) -> List[NumberRecord]:
    # Primary approach: inspect visible result cards/containers.
    visible_texts: List[str] = []
    container_selectors = [
        "[class*='result']",
        "[class*='number']",
        "table",
        "ul",
        "main",
    ]
    for selector in container_selectors:
        locator = page.locator(selector)
        count = min(locator.count(), 20)
        for i in range(count):
            try:
                text = locator.nth(i).inner_text(timeout=1000)
            except PlaywrightTimeoutError:
                continue
            if text and "03" in text:
                visible_texts.append(text)

    # Fallback: whole body text (site layout can change).
    if not visible_texts:
        body_text = page.locator("body").inner_text()
        visible_texts.append(body_text)

    return extract_phone_numbers_from_text_blocks(visible_texts)


def extract_numbers_from_response_text(text: str) -> List[NumberRecord]:
    return extract_phone_numbers_from_text_blocks([text])


def click_search_and_capture_response(page: Page, timeout_ms: int) -> Optional[str]:
    """
    Prefer the network response (cyn-submit) over DOM scraping.
    This is resilient to UI changes and select2 rendering differences.
    """
    try:
        with page.expect_response(
            lambda r: ("cyn-submit" in r.url) and (r.request.method == "POST"),
            timeout=timeout_ms,
        ) as resp_info:
            click_search(page)
        resp = resp_info.value
        return resp.text()
    except PlaywrightTimeoutError:
        return None


def wait_for_search_results(page: Page, timeout_ms: int) -> None:
    """Wait until numbers appear in DOM, or until timeout is reached."""
    deadline_ms = timeout_ms
    elapsed = 0
    step_ms = 1000

    while elapsed < deadline_ms:
        body_text = page.locator("body").inner_text()
        if PHONE_PATTERN.search(body_text):
            return
        page.wait_for_timeout(step_ms)
        elapsed += step_ms


def run_search(config: SearchConfig) -> List[NumberRecord]:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=config.headless)
        page = browser.new_page()
        page.set_default_timeout(config.timeout_ms)
        page.goto(TARGET_URL, wait_until="domcontentloaded")

        if config.mode == "type":
            click_tab_if_present(page, "Type")
        else:
            click_tab_if_present(page, "Search Criteria")

        set_prefix_and_type(
            page,
            mode=config.mode,
            prefix=config.prefix,
            number_type=config.number_type,
        )

        if config.mode == "searchCriteria":
            # Search Criteria tab: digits scope=<select id="searchcriteria">, pattern=<input id="pattern">
            # Prefer stable IDs, fallback to heuristics.
            selected_scope = (
                try_select_by_id(page, "searchcriteria", config.digits_scope)
                or select_dropdown_option_by_text(page, "digits", config.digits_scope)
            )
            if not selected_scope:
                # Generic fallback across all select elements.
                for select in page.locator("select").all():
                    if try_select_by_visible_text(select, config.digits_scope.strip().lower()):
                        selected_scope = True
                        break
            if not selected_scope:
                raise RuntimeError(f"Could not select digits scope: {config.digits_scope}")

            fill_required_number(page, config.required_number)

        response_text = click_search_and_capture_response(
            page, timeout_ms=min(config.timeout_ms, 20000)
        )
        numbers: List[NumberRecord] = []
        if response_text:
            numbers = extract_numbers_from_response_text(response_text)

        if not numbers:
            # Fallback: wait briefly and scrape rendered DOM.
            wait_for_search_results(page, timeout_ms=min(config.timeout_ms, 15000))
            numbers = gather_results(page)

        browser.close()
        return numbers


def save_json(path: str, records: List[NumberRecord]) -> None:
    out = Path(path)
    out.write_text(json.dumps([asdict(r) for r in records], indent=2), encoding="utf-8")


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        mode = str(args.mode)
        required_number = "0"
        digits_scope = str(args.digits_scope)
        if mode == "searchCriteria":
            if not args.required_number:
                parser.error("--required-number is required when --mode=searchCriteria")
                return 2
            required_number = normalize_required_number(args.required_number)

        config = SearchConfig(
            mode=mode,
            required_number=required_number,
            digits_scope=digits_scope,
            number_type=args.number_type,
            prefix=args.prefix,
            timeout_ms=args.timeout_ms,
            headless=not args.show_browser,
        )
    except ValueError as exc:
        parser.error(str(exc))
        return 2

    records = run_search(config)
    json_payload = [asdict(record) for record in records]

    print(json.dumps(json_payload, indent=2))
    print(f"\nFound {len(records)} unique number(s).")

    if args.json_out:
        save_json(args.json_out, records)
        print(f"Saved JSON to: {args.json_out}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
