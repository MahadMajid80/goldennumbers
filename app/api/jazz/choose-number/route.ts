import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Number from "@/models/Number";
import ChooseNumberSettings, {
  type NumberMaskMode,
} from "@/models/ChooseNumberSettings";
import { applyChooseNumberDiscount } from "@/helpers/applyChooseNumberDiscount";
import { maskChooseNumberMsisdn } from "@/helpers/maskChooseNumberMsisdn";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

type JazzOption = {
  value: string;
  label: string;
};

type JazzSearchResult = {
  msisdn: string;
  price: string;
};

type SearchMode = "type" | "searchCriteria";
type ChooseNumberDisplaySettings = {
  discountPercentage: number;
  maskMode: NumberMaskMode;
};
type ParsedSearchRequest =
  | {
      mode: "type";
      type: string;
      prefixType: string;
    }
  | {
      mode: "searchCriteria";
      criteria: string;
      pattern: string;
      prefixCriteria: string;
    };

export const runtime = "nodejs";

const JAZZ_CHOOSE_NUMBER_URL = "https://jazz.com.pk/choose-your-number";
const JAZZ_SEARCH_ENDPOINT = "https://jazz.com.pk/choose-your-number/cyn-submit";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const MAX_FALLBACK_RESULTS = 80;
const MAX_REQUESTS_PER_MINUTE = 25;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_POST_BODY_BYTES = 2048;
const UPSTREAM_TIMEOUT_MS = 15_000;
const SEARCH_CRITERIA_PATTERN_LENGTH: Record<string, number> = {
  FIRSTTHREEDIGITS: 3,
  FIRSTFOURDIGITS: 4,
  MIDDLETHREEDIGITS: 3,
  MIDDLEFOURDIGITS: 4,
  LASTTHREEDIGITS: 3,
  LASTFOURDIGITS: 4,
  ALLSEVENDIGITS: 7,
};
const RATE_LIMIT_BY_IP = new Map<string, { count: number; resetAt: number }>();
const DEFAULT_DISPLAY_SETTINGS: ChooseNumberDisplaySettings = {
  discountPercentage: 0,
  maskMode: "none",
};

const DEFAULT_TYPES: JazzOption[] = [
  { value: "0", label: "NORMAL Rs. 350" },
  { value: "8", label: "SILVER Rs. 600" },
  { value: "7", label: "GOLDEN Rs. 1,500" },
  { value: "6", label: "PLATINUM Rs. 6,000" },
  { value: "5", label: "PLATINUM PLUS Rs. 30,000" },
  { value: "4", label: "PENTA Rs. 75,000" },
  { value: "3", label: "HEXA Rs. 150,000" },
  { value: "2", label: "HEPTA Rs. 1,500,000" },
  { value: "1", label: "OCTA Rs. 2,700,000" },
];

const DEFAULT_PREFIXES_FOR_TYPE: JazzOption[] = [
  { value: "0300", label: "0300" },
  { value: "0301", label: "0301" },
  { value: "0302", label: "0302" },
  { value: "0303", label: "0303" },
  { value: "0304", label: "0304" },
  { value: "0305", label: "0305" },
  { value: "0306", label: "0306" },
  { value: "0307", label: "0307" },
  { value: "0308", label: "0308" },
  { value: "0309", label: "0309" },
  { value: "0320", label: "0320" },
  { value: "0321", label: "0321" },
  { value: "0322", label: "0322" },
  { value: "0323", label: "0323" },
  { value: "0324", label: "0324" },
  { value: "0325", label: "0325" },
  { value: "0326", label: "0326" },
  { value: "0327", label: "0327" },
  { value: "0328", label: "0328" },
  { value: "0329", label: "0329" },
];

const DEFAULT_PREFIXES_FOR_CRITERIA: JazzOption[] = [
  { value: "03**", label: "All" },
  ...DEFAULT_PREFIXES_FOR_TYPE,
];

const DEFAULT_CRITERIA: JazzOption[] = [
  { value: "FIRSTTHREEDIGITS", label: "First 3 Digits" },
  { value: "FIRSTFOURDIGITS", label: "First 4 Digits" },
  { value: "MIDDLETHREEDIGITS", label: "Middle 3 Digits" },
  { value: "MIDDLEFOURDIGITS", label: "Middle 4 Digits" },
  { value: "LASTTHREEDIGITS", label: "Last 3 Digits" },
  { value: "LASTFOURDIGITS", label: "Last 4 Digits" },
  { value: "ALLSEVENDIGITS", label: "All 7 Digits" },
];

const PHONE_PATTERN = /\b03\d{9}\b/g;
const VALID_MSISDN_PATTERN = /^03\d{9}$/;

const CRITERIA_TO_DIGITS_SCOPE: Record<string, string> = {
  FIRSTTHREEDIGITS: "First 3 Digits",
  FIRSTFOURDIGITS: "First 4 Digits",
  MIDDLETHREEDIGITS: "Middle 3 Digits",
  MIDDLEFOURDIGITS: "Middle 4 Digits",
  LASTTHREEDIGITS: "Last 3 Digits",
  LASTFOURDIGITS: "Last 4 Digits",
  ALLSEVENDIGITS: "All 7 Digits",
};

const decodeEntities = (input: string): string =>
  input
    .replaceAll("&amp;", "&")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();

const parseOptions = (html: string, selectId: string): JazzOption[] => {
  const selectRegex = new RegExp(
    `<select[^>]*id=["']${selectId}["'][^>]*>([\\s\\S]*?)<\\/select>`,
    "i",
  );
  const selectMatch = html.match(selectRegex);
  if (!selectMatch?.[1]) return [];

  const optionRegex = /<option[^>]*value=["']?([^"'>]*)["']?[^>]*>([\s\S]*?)<\/option>/gi;
  const options: JazzOption[] = [];
  let match: RegExpExecArray | null = optionRegex.exec(selectMatch[1]);

  while (match) {
    const value = decodeEntities(match[1] ?? "");
    const label = decodeEntities((match[2] ?? "").replace(/<[^>]+>/g, " "));
    if (value && label) {
      options.push({ value, label });
    }
    match = optionRegex.exec(selectMatch[1]);
  }

  return options;
};

const sanitizeResultRow = (row: unknown): JazzSearchResult | null => {
  if (!row || typeof row !== "object") return null;

  const source = row as Record<string, unknown>;
  const msisdnRaw = source.MSISDN;
  const priceRaw = source.Price;

  if (typeof msisdnRaw !== "string" || typeof priceRaw !== "string") return null;

  const msisdn = msisdnRaw.trim();
  const price = priceRaw.trim();
  if (!VALID_MSISDN_PATTERN.test(msisdn) || !price) return null;

  return { msisdn, price };
};

const normalizePrice = (value: string): string => {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  if (/^rs\.?/i.test(cleaned)) return cleaned;
  if (/^\d[\d,]*$/.test(cleaned)) return `Rs ${cleaned}`;
  return cleaned;
};

const extractResultsFromHtmlRows = (text: string): JazzSearchResult[] => {
  // Jazz often renders <td>MSISDN</td><td>Price</td> blocks.
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const cells: string[] = [];
  let cellMatch: RegExpExecArray | null = tdRegex.exec(text);
  while (cellMatch) {
    const rawCell = decodeEntities(cellMatch[1]?.replace(/<[^>]+>/g, " ") ?? "");
    const normalized = rawCell.replace(/\s+/g, " ").trim();
    if (normalized) cells.push(normalized);
    cellMatch = tdRegex.exec(text);
  }

  const results: JazzSearchResult[] = [];
  for (let i = 0; i < cells.length - 1; i += 1) {
    const msisdnCandidate = cells[i];
    const priceCandidate = cells[i + 1];
    const phone = (msisdnCandidate.match(/\b03\d{9}\b/) ?? [])[0];
    PHONE_PATTERN.lastIndex = 0;
    if (!phone) continue;

    const price = normalizePrice(priceCandidate);
    if (!price) continue;
    results.push({ msisdn: phone, price });
  }

  return results;
};

const extractResultsFromText = (text: string): JazzSearchResult[] => {
  const matches = text.match(PHONE_PATTERN) ?? [];
  PHONE_PATTERN.lastIndex = 0;
  const unique = Array.from(new Set(matches));
  return unique.map((msisdn) => ({ msisdn, price: "Price On Call" }));
};

const toDigits = (value: string): string => value.replace(/\D+/g, "");
const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstHop = forwardedFor.split(",")[0]?.trim();
    if (firstHop) return firstHop;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
};

const enforceRateLimit = (request: Request): boolean => {
  const now = Date.now();
  const ip = getClientIp(request);
  const existing = RATE_LIMIT_BY_IP.get(ip);

  if (!existing || now >= existing.resetAt) {
    RATE_LIMIT_BY_IP.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (existing.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  existing.count += 1;
  return true;
};

const validatePrefixType = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return /^03\d{2}$/.test(normalized) ? normalized : null;
};

const validatePrefixCriteria = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized === "03**" || /^03\d{2}$/.test(normalized) ? normalized : null;
};

const validateType = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return DEFAULT_TYPES.some((item) => item.value === normalized) ? normalized : null;
};

const validateCriteria = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return Object.prototype.hasOwnProperty.call(SEARCH_CRITERIA_PATTERN_LENGTH, normalized)
    ? normalized
    : null;
};

const parseSearchRequestBody = (rawBody: unknown): ParsedSearchRequest | null => {
  if (!rawBody || typeof rawBody !== "object") return null;
  const body = rawBody as Record<string, unknown>;

  if (body.mode === "type") {
    const type = validateType(body.type);
    const prefixType = validatePrefixType(body.prefixType);
    if (!type || !prefixType) return null;
    return { mode: "type", type, prefixType };
  }

  if (body.mode === "searchCriteria") {
    const criteria = validateCriteria(body.criteria);
    const prefixCriteria = validatePrefixCriteria(body.prefixCriteria);
    if (!criteria || !prefixCriteria || typeof body.pattern !== "string") return null;
    const pattern = body.pattern.trim();
    const expectedLength = SEARCH_CRITERIA_PATTERN_LENGTH[criteria];
    if (!/^\d+$/.test(pattern) || pattern.length !== expectedLength) return null;
    return { mode: "searchCriteria", criteria, pattern, prefixCriteria };
  }

  return null;
};

const getChooseNumberDisplaySettings = async (): Promise<ChooseNumberDisplaySettings> => {
  try {
    await connectDB();
    const settings = await ChooseNumberSettings.findOne().sort({ createdAt: -1 });
    if (!settings) return DEFAULT_DISPLAY_SETTINGS;

    return {
      discountPercentage:
        typeof settings.discountPercentage === "number"
          ? settings.discountPercentage
          : 0,
      maskMode: settings.maskMode ?? "none",
    };
  } catch {
    return DEFAULT_DISPLAY_SETTINGS;
  }
};

const applyDisplayRulesToResults = (
  results: JazzSearchResult[],
  settings: ChooseNumberDisplaySettings,
): JazzSearchResult[] =>
  results.map((result) => ({
    msisdn: maskChooseNumberMsisdn(result.msisdn, settings.maskMode),
    price: applyChooseNumberDiscount(result.price, settings.discountPercentage),
  }));

const matchesCriteria = (
  suffixSevenDigits: string,
  criteria: string,
  pattern: string,
): boolean => {
  const safePattern = pattern.replace(/\D+/g, "");
  if (!safePattern) return false;

  if (criteria === "FIRSTTHREEDIGITS") return suffixSevenDigits.startsWith(safePattern);
  if (criteria === "FIRSTFOURDIGITS") return suffixSevenDigits.startsWith(safePattern);
  if (criteria === "MIDDLETHREEDIGITS")
    return suffixSevenDigits.slice(2, 5) === safePattern;
  if (criteria === "MIDDLEFOURDIGITS")
    return suffixSevenDigits.slice(2, 6) === safePattern;
  if (criteria === "LASTTHREEDIGITS") return suffixSevenDigits.endsWith(safePattern);
  if (criteria === "LASTFOURDIGITS") return suffixSevenDigits.endsWith(safePattern);
  if (criteria === "ALLSEVENDIGITS") return suffixSevenDigits === safePattern;

  return false;
};

const fallbackSearchFromInternalDb = async (args: {
  mode: SearchMode;
  prefix: string;
  criteria?: string;
  pattern?: string;
}): Promise<JazzSearchResult[]> => {
  await connectDB();

  const normalizedPrefix = args.prefix === "03**" ? "03" : args.prefix;

  const candidates = await Number.find({
    status: "available",
    number: { $regex: `^${escapeRegex(normalizedPrefix)}` },
  })
    .sort({ createdAt: -1 })
    .select({ number: 1, price: 1, _id: 0 })
    .limit(300);

  const shaped = candidates
    .map((item) => {
      const msisdn = typeof item.number === "string" ? item.number.trim() : "";
      const price = typeof item.price === "string" ? item.price.trim() : "";
      if (!VALID_MSISDN_PATTERN.test(msisdn) || !price) return null;
      return { msisdn, price };
    })
    .filter((item): item is JazzSearchResult => item !== null);

  if (args.mode === "type") {
    return shaped.slice(0, MAX_FALLBACK_RESULTS);
  }

  const criteria = args.criteria ?? "";
  const pattern = args.pattern ?? "";

  return shaped
    .filter((item) => {
      const digits = toDigits(item.msisdn);
      const suffix = digits.slice(-7);
      if (suffix.length !== 7) return false;
      return matchesCriteria(suffix, criteria, pattern);
    })
    .slice(0, MAX_FALLBACK_RESULTS);
};

const safeFallbackSearch = async (args: {
  mode: SearchMode;
  prefix: string;
  criteria?: string;
  pattern?: string;
}): Promise<JazzSearchResult[]> => {
  try {
    return await fallbackSearchFromInternalDb(args);
  } catch {
    return [];
  }
};

const getTypeNameFromValue = (value: string): string | null => {
  const match = DEFAULT_TYPES.find((t) => t.value === value);
  if (!match) return null;
  // e.g. "GOLDEN Rs. 1,500" -> "GOLDEN"
  const firstToken = match.label.split(/\s+/)[0]?.trim();
  return firstToken || null;
};

const runPythonScraper = async (args: {
  mode: SearchMode;
  requiredNumber: string;
  digitsScope: string;
  prefix?: string;
  numberType?: string;
}): Promise<JazzSearchResult[]> => {
  const cwd = process.cwd();
  const venvPython = path.join(cwd, ".venv", "bin", "python");
  const pythonPath = fs.existsSync(venvPython) ? venvPython : "python3";
  const scriptPath = path.join(cwd, "jazz_number_scraper.py");

  const scraperArgs: string[] = [
    scriptPath,
    "--mode",
    args.mode,
    // Required only for searchCriteria mode; harmless for type mode.
    "--required-number",
    args.requiredNumber,
    "--digits-scope",
    args.digitsScope,
    "--timeout-ms",
    "30000",
  ];

  if (args.numberType) {
    scraperArgs.push("--type", args.numberType);
  }
  if (args.prefix) {
    scraperArgs.push("--prefix", args.prefix);
  }

  const stdout = await new Promise<string>((resolve, reject) => {
    const child = spawn(pythonPath, scraperArgs, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let out = "";
    let err = "";

    child.stdout.on("data", (buf: Buffer) => {
      out += buf.toString("utf-8");
    });
    child.stderr.on("data", (buf: Buffer) => {
      err += buf.toString("utf-8");
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve(out);
      reject(new Error(err || `Scraper exited with code ${code}`));
    });
  });

  const startIdx = stdout.indexOf("[");
  const endIdx = stdout.lastIndexOf("]");
  const jsonSlice =
    startIdx >= 0 && endIdx >= startIdx ? stdout.slice(startIdx, endIdx + 1) : "";

  const parsed = JSON.parse(jsonSlice) as unknown;
  if (!Array.isArray(parsed)) return [];

  const results = parsed
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const full = typeof r.full_number === "string" ? r.full_number.trim() : "";
      if (!full) return null;
      return { msisdn: full, price: "Price On Call" } satisfies JazzSearchResult;
    })
    .filter((x): x is JazzSearchResult => x !== null);

  return results.slice(0, MAX_FALLBACK_RESULTS);
};

export async function GET(request: Request) {
  try {
    if (!enforceRateLimit(request)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const response = await fetch(JAZZ_CHOOSE_NUMBER_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Unable to load Jazz number metadata.",
          details: `Jazz responded with HTTP ${response.status}.`,
        },
        { status: 502 },
      );
    }

    const html = await response.text();

    const types = parseOptions(html, "type").filter((o) => o.value !== "");
    const prefixesForType = parseOptions(html, "ndc_type").filter(
      (o) => o.value !== "0",
    );
    const prefixesForCriteria = parseOptions(html, "ndc").filter(
      (o) => o.value !== "0",
    );
    const criteria = parseOptions(html, "searchcriteria").filter(
      (o) => o.value.toLowerCase() !== "zero",
    );

    return NextResponse.json({
      source: JAZZ_CHOOSE_NUMBER_URL,
      types,
      prefixesForType,
      prefixesForCriteria,
      criteria,
      fallbackUsed: false,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      source: "internal-fallback",
      types: DEFAULT_TYPES,
      prefixesForType: DEFAULT_PREFIXES_FOR_TYPE,
      prefixesForCriteria: DEFAULT_PREFIXES_FOR_CRITERIA,
      criteria: DEFAULT_CRITERIA,
      fallbackUsed: true,
      details: error instanceof Error ? error.message : String(error),
      fetchedAt: new Date().toISOString(),
    });
  }
}

export async function POST(request: Request) {
  let parsedBody: ParsedSearchRequest | null = null;

  try {
    if (!enforceRateLimit(request)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json({ error: "Invalid content type." }, { status: 415 });
    }

    const contentLengthHeader = request.headers.get("content-length");
    if (contentLengthHeader) {
      const contentLength = globalThis.Number(contentLengthHeader);
      if (
        globalThis.Number.isFinite(contentLength) &&
        contentLength > MAX_POST_BODY_BYTES
      ) {
        return NextResponse.json({ error: "Request payload too large." }, { status: 413 });
      }
    }

    const rawBody = (await request.json()) as unknown;
    const body = parseSearchRequestBody(rawBody);
    if (!body) {
      return NextResponse.json({ error: "Invalid search request payload." }, { status: 400 });
    }
    parsedBody = body;

    const mode = body.mode;
    const displaySettings = await getChooseNumberDisplaySettings();
    const payload = new URLSearchParams();
    payload.set("PreOrPost", "PREPAID");
    payload.set("XID", "");
    payload.set("token", "");

    let effectivePrefixForFallback = "";
    let effectiveCriteriaForFallback = "";
    let effectivePatternForFallback = "";
    let numberTypeForScraper: string | undefined;

    if (mode === "type") {
      payload.set("type", body.type);
      // Jazz uses a separate prefix field for Type-mode.
      payload.set("ndc_type", body.prefixType);
      effectivePrefixForFallback = body.prefixType;
      numberTypeForScraper = getTypeNameFromValue(body.type) ?? undefined;
    } else {
      payload.set("searchcriteria", body.criteria);
      payload.set("pattern", body.pattern);
      payload.set("ndc", body.prefixCriteria);
      effectivePrefixForFallback = body.prefixCriteria;
      effectiveCriteriaForFallback = body.criteria;
      effectivePatternForFallback = body.pattern;
    }

    const response = await fetch(JAZZ_SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json, text/plain, text/html, */*",
        Origin: "https://jazz.com.pk",
        Referer: JAZZ_CHOOSE_NUMBER_URL,
      },
      body: payload.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!response.ok) {
      let pythonAttempted = false;
      let pythonError: string | null = null;

      // Local/dev: use the provided Playwright scraper (most reliable vs anti-bot).
      if (process.env.NODE_ENV === "development") {
        pythonAttempted = true;
        const digitsScope =
          mode === "searchCriteria"
            ? (CRITERIA_TO_DIGITS_SCOPE[effectiveCriteriaForFallback] ??
              "All 7 Digits")
            : (CRITERIA_TO_DIGITS_SCOPE.LASTTHREEDIGITS ?? "Last 3 Digits");
        const requiredNumber =
          mode === "searchCriteria"
            ? effectivePatternForFallback
            : "786"; // default probe for type-mode if user didn't provide pattern

        try {
          const pythonResults = await runPythonScraper({
            mode,
            requiredNumber,
            digitsScope,
            prefix: effectivePrefixForFallback || undefined,
            numberType: numberTypeForScraper,
          });

          if (pythonResults.length > 0) {
            const transformedResults = applyDisplayRulesToResults(
              pythonResults,
              displaySettings,
            );
            return NextResponse.json({
              source: "python-playwright",
              fallbackUsed: true,
              extractionMode: "python-playwright",
              details: `Jazz responded with HTTP ${response.status}. Used python scraper.`,
              count: transformedResults.length,
              results: transformedResults,
            });
          }
        } catch (e) {
          pythonError = e instanceof Error ? e.message : String(e);
        }
      }

      const fallbackResults = await safeFallbackSearch({
        mode,
        prefix: effectivePrefixForFallback,
        criteria: effectiveCriteriaForFallback,
        pattern: effectivePatternForFallback,
      });
      const transformedFallbackResults = applyDisplayRulesToResults(
        fallbackResults,
        displaySettings,
      );

      return NextResponse.json({
        source: "internal-fallback",
        fallbackUsed: true,
        details: `Jazz responded with HTTP ${response.status}.`,
        extractionMode: "internal-fallback",
        ...(process.env.NODE_ENV === "development"
          ? {
              debug: {
                pythonError,
                pythonAttempted,
              },
            }
          : {}),
        count: transformedFallbackResults.length,
        results: transformedFallbackResults,
      });
    }

    const rawResponseText = await response.text();
    let parsedJson: unknown = null;
    try {
      parsedJson = JSON.parse(rawResponseText) as unknown;
    } catch {
      parsedJson = null;
    }

    if (Array.isArray(parsedJson)) {
      const results = parsedJson
        .map((item) => sanitizeResultRow(item))
        .filter((item): item is JazzSearchResult => item !== null);

      // If Jazz returns an empty array (common when blocked), try Playwright in dev.
      if (results.length === 0 && process.env.NODE_ENV === "development") {
        const digitsScope =
          mode === "searchCriteria"
            ? (CRITERIA_TO_DIGITS_SCOPE[effectiveCriteriaForFallback] ??
              "All 7 Digits")
            : (CRITERIA_TO_DIGITS_SCOPE.LASTTHREEDIGITS ?? "Last 3 Digits");
        const requiredNumber =
          mode === "searchCriteria" ? effectivePatternForFallback : "786";

        try {
          const pythonResults = await runPythonScraper({
            mode,
            requiredNumber,
            digitsScope,
            prefix: effectivePrefixForFallback || undefined,
            numberType: numberTypeForScraper,
          });
          if (pythonResults.length > 0) {
            const transformedResults = applyDisplayRulesToResults(
              pythonResults,
              displaySettings,
            );
            return NextResponse.json({
              source: "python-playwright",
              fallbackUsed: true,
              extractionMode: "python-playwright",
              details:
                "Jazz returned an empty result set. Used python scraper instead.",
              count: transformedResults.length,
              results: transformedResults,
            });
          }
        } catch {
          // continue with normal response
        }
      }

      const transformedResults = applyDisplayRulesToResults(results, displaySettings);
      return NextResponse.json({
        source: JAZZ_SEARCH_ENDPOINT,
        fallbackUsed: false,
        extractionMode: "json",
        count: transformedResults.length,
        results: transformedResults,
      });
    }

    const htmlExtracted = extractResultsFromHtmlRows(rawResponseText);
    if (htmlExtracted.length > 0) {
      const transformedResults = applyDisplayRulesToResults(
        htmlExtracted.slice(0, MAX_FALLBACK_RESULTS),
        displaySettings,
      );
      return NextResponse.json({
        source: JAZZ_SEARCH_ENDPOINT,
        fallbackUsed: false,
        extractionMode: "html-table",
        count: transformedResults.length,
        results: transformedResults,
      });
    }

    const textExtracted = extractResultsFromText(rawResponseText);
    if (textExtracted.length > 0) {
      const transformedResults = applyDisplayRulesToResults(
        textExtracted.slice(0, MAX_FALLBACK_RESULTS),
        displaySettings,
      );
      return NextResponse.json({
        source: JAZZ_SEARCH_ENDPOINT,
        fallbackUsed: false,
        extractionMode: "text-regex",
        count: transformedResults.length,
        results: transformedResults,
      });
    }

    if (!Array.isArray(parsedJson)) {
      // Local/dev: try python scraper before DB fallback
      if (process.env.NODE_ENV === "development") {
        const digitsScope =
          mode === "searchCriteria"
            ? (CRITERIA_TO_DIGITS_SCOPE[effectiveCriteriaForFallback] ??
              "All 7 Digits")
            : (CRITERIA_TO_DIGITS_SCOPE.LASTTHREEDIGITS ?? "Last 3 Digits");
        const requiredNumber =
          mode === "searchCriteria"
            ? effectivePatternForFallback
            : "786";

        try {
          const pythonResults = await runPythonScraper({
            mode,
            requiredNumber,
            digitsScope,
            prefix: effectivePrefixForFallback || undefined,
            numberType: numberTypeForScraper,
          });

          if (pythonResults.length > 0) {
            const transformedResults = applyDisplayRulesToResults(
              pythonResults,
              displaySettings,
            );
            return NextResponse.json({
              source: "python-playwright",
              fallbackUsed: true,
              extractionMode: "python-playwright",
              details: "Jazz returned an unexpected response. Used python scraper.",
              count: transformedResults.length,
              results: transformedResults,
            });
          }
        } catch {
          // continue to DB fallback
        }
      }

      const fallbackResults = await safeFallbackSearch({
        mode,
        prefix: effectivePrefixForFallback,
        criteria: effectiveCriteriaForFallback,
        pattern: effectivePatternForFallback,
      });
      const transformedFallbackResults = applyDisplayRulesToResults(
        fallbackResults,
        displaySettings,
      );

      return NextResponse.json({
        source: "internal-fallback",
        fallbackUsed: true,
        details: "Unexpected search response from Jazz. Used internal fallback.",
        extractionMode: "internal-fallback",
        count: transformedFallbackResults.length,
        results: transformedFallbackResults,
      });
    }
  } catch (error) {
    try {
      const body = parsedBody;
      const mode: SearchMode = body?.mode ?? "searchCriteria";
      const prefix =
        body?.mode === "type"
          ? body.prefixType
          : (body?.prefixCriteria ?? "03**");

      const fallbackResults = await safeFallbackSearch({
        mode,
        prefix,
        criteria: body?.mode === "searchCriteria" ? body.criteria : undefined,
        pattern: body?.mode === "searchCriteria" ? body.pattern : undefined,
      });
      const displaySettings = await getChooseNumberDisplaySettings();
      const transformedFallbackResults = applyDisplayRulesToResults(
        fallbackResults,
        displaySettings,
      );

      return NextResponse.json({
        source: "internal-fallback",
        fallbackUsed: true,
        details: error instanceof Error ? error.message : String(error),
        count: transformedFallbackResults.length,
        results: transformedFallbackResults,
      });
    } catch {
      return NextResponse.json({
        source: "internal-fallback",
        fallbackUsed: true,
        extractionMode: "internal-fallback-empty",
        details: "Search is temporarily unavailable from Jazz and local fallback.",
        count: 0,
        results: [],
      });
    }
  }
}
