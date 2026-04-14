import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Number from "@/models/Number";

type JazzOption = {
  value: string;
  label: string;
};

type JazzSearchResult = {
  msisdn: string;
  price: string;
};

type SearchMode = "type" | "searchCriteria";

const JAZZ_CHOOSE_NUMBER_URL = "https://jazz.com.pk/choose-your-number";
const JAZZ_SEARCH_ENDPOINT = "https://jazz.com.pk/choose-your-number/cyn-submit";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const MAX_FALLBACK_RESULTS = 80;

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

const toDigits = (value: string): string => value.replace(/\D+/g, "");

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
    number: { $regex: `^${normalizedPrefix}` },
  })
    .sort({ createdAt: -1 })
    .select({ number: 1, price: 1, _id: 0 })
    .limit(300);

  const shaped = candidates
    .map((item) => {
      const msisdn = typeof item.number === "string" ? item.number.trim() : "";
      const price = typeof item.price === "string" ? item.price.trim() : "";
      if (!msisdn || !price) return null;
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
  let parsedBody:
    | {
        mode?: SearchMode;
        type?: string;
        prefixType?: string;
        criteria?: string;
        pattern?: string;
        prefixCriteria?: string;
      }
    | null = null;

  try {
    const body = (await request.json()) as {
      mode?: "type" | "searchCriteria";
      type?: string;
      prefixType?: string;
      criteria?: string;
      pattern?: string;
      prefixCriteria?: string;
    };
    parsedBody = body;

    const mode = body.mode;
    if (mode !== "type" && mode !== "searchCriteria") {
      return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
    }

    const payload = new URLSearchParams();
    payload.set("PreOrPost", "PREPAID");
    payload.set("XID", "");
    payload.set("token", "");

    let effectivePrefixForFallback = "";
    let effectiveCriteriaForFallback = "";
    let effectivePatternForFallback = "";

    if (mode === "type") {
      if (!body.type || !body.prefixType) {
        return NextResponse.json(
          { error: "Type and prefix are required." },
          { status: 400 },
        );
      }
      payload.set("type", body.type);
      payload.set("ndc", body.prefixType);
      effectivePrefixForFallback = body.prefixType;
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
      effectivePrefixForFallback = body.prefixCriteria;
      effectiveCriteriaForFallback = body.criteria;
      effectivePatternForFallback = body.pattern;
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
      const fallbackResults = await fallbackSearchFromInternalDb({
        mode,
        prefix: effectivePrefixForFallback,
        criteria: effectiveCriteriaForFallback,
        pattern: effectivePatternForFallback,
      });

      return NextResponse.json({
        source: "internal-fallback",
        fallbackUsed: true,
        details: `Jazz responded with HTTP ${response.status}.`,
        count: fallbackResults.length,
        results: fallbackResults,
      });
    }

    const rawData = (await response.json()) as unknown;
    if (!Array.isArray(rawData)) {
      const fallbackResults = await fallbackSearchFromInternalDb({
        mode,
        prefix: effectivePrefixForFallback,
        criteria: effectiveCriteriaForFallback,
        pattern: effectivePatternForFallback,
      });

      return NextResponse.json({
        source: "internal-fallback",
        fallbackUsed: true,
        details: "Unexpected search response from Jazz.",
        count: fallbackResults.length,
        results: fallbackResults,
      });
    }

    const results = rawData
      .map((item) => sanitizeResultRow(item))
      .filter((item): item is JazzSearchResult => item !== null);

    return NextResponse.json({
      source: JAZZ_SEARCH_ENDPOINT,
      fallbackUsed: false,
      count: results.length,
      results,
    });
  } catch (error) {
    try {
      const body = parsedBody ?? {};
      const mode =
        body.mode === "type" || body.mode === "searchCriteria"
          ? body.mode
          : "searchCriteria";
      const prefix =
        mode === "type"
          ? (body.prefixType ?? "03")
          : (body.prefixCriteria ?? "03**");

      const fallbackResults = await fallbackSearchFromInternalDb({
        mode,
        prefix,
        criteria: body.criteria,
        pattern: body.pattern,
      });

      return NextResponse.json({
        source: "internal-fallback",
        fallbackUsed: true,
        details: error instanceof Error ? error.message : String(error),
        count: fallbackResults.length,
        results: fallbackResults,
      });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: "Failed to search Jazz numbers.",
          details:
            fallbackError instanceof Error
              ? fallbackError.message
              : String(fallbackError),
        },
        { status: 500 },
      );
    }
  }
}
