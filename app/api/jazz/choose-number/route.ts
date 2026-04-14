import { NextResponse } from "next/server";

type JazzOption = {
  value: string;
  label: string;
};

type JazzSearchResult = {
  msisdn: string;
  price: string;
};

const JAZZ_CHOOSE_NUMBER_URL = "https://jazz.com.pk/choose-your-number";
const JAZZ_SEARCH_ENDPOINT = "https://jazz.com.pk/choose-your-number/cyn-submit";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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
  if (!msisdn || !price) return null;

  return { msisdn, price };
};

export async function GET() {
  try {
    const response = await fetch(JAZZ_CHOOSE_NUMBER_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 1800 },
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
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch Jazz number metadata.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mode?: "type" | "searchCriteria";
      type?: string;
      prefixType?: string;
      criteria?: string;
      pattern?: string;
      prefixCriteria?: string;
    };

    const mode = body.mode;
    if (mode !== "type" && mode !== "searchCriteria") {
      return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
    }

    const payload = new URLSearchParams();
    payload.set("PreOrPost", "PREPAID");
    payload.set("XID", "");
    payload.set("token", "");

    if (mode === "type") {
      if (!body.type || !body.prefixType) {
        return NextResponse.json(
          { error: "Type and prefix are required." },
          { status: 400 },
        );
      }
      payload.set("type", body.type);
      payload.set("ndc", body.prefixType);
    } else {
      if (!body.criteria || !body.pattern || !body.prefixCriteria) {
        return NextResponse.json(
          { error: "Criteria, pattern, and prefix are required." },
          { status: 400 },
        );
      }
      payload.set("searchcriteria", body.criteria);
      payload.set("pattern", body.pattern);
      payload.set("ndc", body.prefixCriteria);
    }

    const response = await fetch(JAZZ_SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json, text/plain, */*",
        Origin: "https://jazz.com.pk",
        Referer: JAZZ_CHOOSE_NUMBER_URL,
      },
      body: payload.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Jazz search request failed.",
          details: `Jazz responded with HTTP ${response.status}.`,
        },
        { status: 502 },
      );
    }

    const rawData = (await response.json()) as unknown;
    if (!Array.isArray(rawData)) {
      return NextResponse.json(
        {
          error: "Unexpected search response from Jazz.",
        },
        { status: 502 },
      );
    }

    const results = rawData
      .map((item) => sanitizeResultRow(item))
      .filter((item): item is JazzSearchResult => item !== null);

    return NextResponse.json({
      source: JAZZ_SEARCH_ENDPOINT,
      count: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to search Jazz numbers.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
