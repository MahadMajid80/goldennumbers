"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type JazzOption = {
  value: string;
  label: string;
};

type JazzSearchResult = {
  msisdn: string;
  price: string;
};

type SearchMode = "searchCriteria" | "type";

type MetaResponse = {
  source: string;
  types: JazzOption[];
  prefixesForType: JazzOption[];
  prefixesForCriteria: JazzOption[];
  criteria: JazzOption[];
};

type SearchResponse = {
  source: string;
  count: number;
  results: JazzSearchResult[];
};

const defaultCriteriaPatternByValue: Record<string, string> = {
  FIRSTTHREEDIGITS: "3",
  FIRSTFOURDIGITS: "4",
  MIDDLETHREEDIGITS: "3",
  MIDDLEFOURDIGITS: "4",
  LASTTHREEDIGITS: "3",
  LASTFOURDIGITS: "4",
  ALLSEVENDIGITS: "7",
};

const getPatternLength = (criteria: string): number =>
  Number(defaultCriteriaPatternByValue[criteria] ?? "7");

const sanitizePatternInput = (value: string, maxLength: number): string =>
  value.replace(/\D+/g, "").slice(0, maxLength);

const ChooseYourNumberSection = () => {
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [types, setTypes] = useState<JazzOption[]>([]);
  const [prefixesForType, setPrefixesForType] = useState<JazzOption[]>([]);
  const [prefixesForCriteria, setPrefixesForCriteria] = useState<JazzOption[]>(
    [],
  );
  const [criteriaOptions, setCriteriaOptions] = useState<JazzOption[]>([]);

  const [mode, setMode] = useState<SearchMode>("searchCriteria");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTypePrefix, setSelectedTypePrefix] = useState("");
  const [selectedCriteriaPrefix, setSelectedCriteriaPrefix] = useState("03**");
  const [selectedCriteria, setSelectedCriteria] = useState("ALLSEVENDIGITS");
  const [pattern, setPattern] = useState("");

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<JazzSearchResult[]>([]);
  const [copiedMsisdn, setCopiedMsisdn] = useState<string | null>(null);

  const patternLength = useMemo(
    () => getPatternLength(selectedCriteria),
    [selectedCriteria],
  );

  useEffect(() => {
    const loadMeta = async (): Promise<void> => {
      try {
        setMetaLoading(true);
        setMetaError(null);

        const response = await fetch("/api/jazz/choose-number", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as MetaResponse & {
          error?: string;
          details?: string;
        };

        if (!response.ok || data.error) {
          setMetaError(
            data.error ?? "Unable to load Choose Your Number configuration.",
          );
          return;
        }

        setTypes(Array.isArray(data.types) ? data.types : []);
        setPrefixesForType(
          Array.isArray(data.prefixesForType) ? data.prefixesForType : [],
        );
        setPrefixesForCriteria(
          Array.isArray(data.prefixesForCriteria)
            ? data.prefixesForCriteria
            : [],
        );
        setCriteriaOptions(Array.isArray(data.criteria) ? data.criteria : []);

        if (
          Array.isArray(data.prefixesForType) &&
          data.prefixesForType.length > 0
        ) {
          setSelectedTypePrefix(data.prefixesForType[0].value);
        }

        if (
          Array.isArray(data.prefixesForCriteria) &&
          data.prefixesForCriteria.length > 0
        ) {
          const allOption = data.prefixesForCriteria.find(
            (p) => p.value === "03**",
          );
          setSelectedCriteriaPrefix(
            allOption?.value ?? data.prefixesForCriteria[0].value,
          );
        }

        if (Array.isArray(data.criteria) && data.criteria.length > 0) {
          const allSeven = data.criteria.find(
            (c) => c.value === "ALLSEVENDIGITS",
          );
          setSelectedCriteria(allSeven?.value ?? data.criteria[0].value);
        }
      } catch (error) {
        setMetaError(
          error instanceof Error
            ? error.message
            : "Unable to load Choose Your Number configuration.",
        );
      } finally {
        setMetaLoading(false);
      }
    };

    void loadMeta();
  }, []);

  const handleSearch = async (): Promise<void> => {
    setSearchError(null);
    setSearchResults([]);

    if (mode === "type") {
      if (!selectedType) {
        setSearchError("Please select a type.");
        return;
      }
      if (!selectedTypePrefix) {
        setSearchError("Please select a prefix.");
        return;
      }
    }

    if (mode === "searchCriteria") {
      if (!selectedCriteriaPrefix) {
        setSearchError("Please select a prefix.");
        return;
      }
      if (!selectedCriteria) {
        setSearchError("Please select a criteria.");
        return;
      }
      if (pattern.length !== patternLength) {
        setSearchError(`Please enter exactly ${patternLength} digits.`);
        return;
      }
    }

    try {
      setSearchLoading(true);
      const payload =
        mode === "type"
          ? {
              mode: "type" as const,
              type: selectedType,
              prefixType: selectedTypePrefix,
            }
          : {
              mode: "searchCriteria" as const,
              criteria: selectedCriteria,
              pattern,
              prefixCriteria: selectedCriteriaPrefix,
            };

      const response = await fetch("/api/jazz/choose-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as SearchResponse & {
        error?: string;
        details?: string;
      };

      if (!response.ok || data.error) {
        setSearchError(
          data.error ??
            "Search did not return data. Jazz may have blocked this query.",
        );
        return;
      }

      setSearchResults(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : "Unable to search right now.",
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCopy = async (msisdn: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(msisdn);
      setCopiedMsisdn(msisdn);
      window.setTimeout(() => {
        setCopiedMsisdn((prev) => (prev === msisdn ? null : prev));
      }, 1200);
    } catch {
      // ignore (clipboard may be blocked)
    }
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="rounded-xl border border-[#FFD700]/45 bg-zinc-950/25 p-4 shadow-[inset_0_1px_0_0_rgba(255,215,0,0.06)] md:p-6">
        <div className="mb-6 text-center">
          <div className="inline-block">
            <h2 className="mb-2 text-2xl font-bold text-white">
              Choose Your Number
            </h2>
            <div className="h-1 rounded bg-gradient-to-r from-[#FFD700] to-[#FFA500]" />
          </div>
        </div>

        <div className="mb-5 flex justify-center">
          <div className="flex w-full max-w-md rounded-xl border border-gray-700 bg-black/30 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("searchCriteria");
                setSearchError(null);
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                mode === "searchCriteria"
                  ? "bg-[#FFD700] text-black"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Search Criteria
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("type");
                setSearchError(null);
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                mode === "type"
                  ? "bg-[#FFD700] text-black"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Type
            </button>
          </div>
        </div>

        {metaLoading ? (
          <div className="py-8 text-center text-white">Loading options...</div>
        ) : metaError ? (
          <div className="rounded-lg border border-red-500/40 bg-red-950/20 p-4 text-center text-sm text-red-300">
            {metaError}
          </div>
        ) : (
          <>
            {mode === "type" ? (
              <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-end md:justify-center">
                <label className="flex w-full flex-col gap-1 md:w-72">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Type
                  </span>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#FFD700]"
                  >
                    <option value="">Select Type</option>
                    {types.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex w-full flex-col gap-1 md:w-56">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Prefix
                  </span>
                  <select
                    value={selectedTypePrefix}
                    onChange={(e) => setSelectedTypePrefix(e.target.value)}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#FFD700]"
                  >
                    {prefixesForType.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex w-full items-end md:w-56">
                  <button
                    type="button"
                    onClick={() => void handleSearch()}
                    disabled={searchLoading}
                    className="w-full rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#e6c84a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {searchLoading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                      Prefix
                    </span>
                    <select
                      value={selectedCriteriaPrefix}
                      onChange={(e) =>
                        setSelectedCriteriaPrefix(e.target.value)
                      }
                      className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#FFD700]"
                    >
                      {prefixesForCriteria.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                      Criteria
                    </span>
                    <select
                      value={selectedCriteria}
                      onChange={(e) => {
                        const nextCriteria = e.target.value;
                        setSelectedCriteria(nextCriteria);
                        const nextLength = getPatternLength(nextCriteria);
                        setPattern((prev) => prev.slice(0, nextLength));
                      }}
                      className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#FFD700]"
                    >
                      {criteriaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                      Required Number
                    </span>
                    <input
                      value={pattern}
                      onChange={(e) =>
                        setPattern(
                          sanitizePatternInput(e.target.value, patternLength),
                        )
                      }
                      inputMode="numeric"
                      maxLength={patternLength}
                      placeholder={`Enter ${patternLength} digits`}
                      className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[#FFD700]"
                    />
                  </label>
                </>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => void handleSearch()}
                    disabled={searchLoading}
                    className="w-full rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#e6c84a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {searchLoading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            )}

            {searchError && (
              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/20 p-3 text-sm text-red-300">
                {searchError}
              </div>
            )}

            {searchLoading && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-300">
                    Searching available numbers…
                  </p>
                  <div
                    className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFD700]/70 border-t-transparent"
                    aria-label="Loading"
                    role="status"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={idx}
                      className="relative overflow-hidden rounded-2xl border border-gray-700/60 bg-gradient-to-br from-[#0f1419] via-[#151b24] to-[#0c1016] p-4 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl border border-gray-700/50 bg-black/35" />
                          <div className="min-w-0">
                            <div className="h-3 w-28 rounded bg-white/10" />
                            <div className="mt-3 h-6 w-44 rounded bg-[#FFD700]/15" />
                          </div>
                        </div>
                        <div className="h-6 w-24 rounded-full bg-white/10" />
                      </div>

                      <div className="mt-4 border-t border-gray-700/50 pt-3">
                        <div className="h-8 w-24 rounded-full bg-white/10" />
                      </div>

                      <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!searchError && !searchLoading && searchResults.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-300">
                    Showing{" "}
                    <span className="font-semibold text-white">
                      {searchResults.length}
                    </span>{" "}
                    result(s)
                  </p>
                  {copiedMsisdn && (
                    <span className="rounded-full border border-[#FFD700]/25 bg-[#FFD700]/10 px-3 py-1 text-xs font-semibold text-[#e8cf6a]">
                      Copied {copiedMsisdn}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {searchResults.map((result) => (
                    <div
                      key={`${result.msisdn}-${result.price}`}
                      className="group relative overflow-hidden rounded-2xl border border-gray-700/60 bg-gradient-to-br from-[#0f1419] via-[#151b24] to-[#0c1016] p-4 shadow-lg transition-all duration-300 hover:border-[#FFD700]/35 hover:shadow-[0_12px_40px_-12px_rgba(255,215,0,0.18)]"
                    >
                      <div
                        className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-[#FFD700] via-[#d4af37] to-[#8a7020] opacity-80"
                        aria-hidden
                      />

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-700/50 bg-black/35">
                            <Image
                              src="/jazz-logo.png"
                              alt="Jazz"
                              width={56}
                              height={28}
                              className="h-6 w-auto object-contain"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Available Number
                            </p>
                            <p
                              className="mt-1 break-words text-xl font-bold tracking-tight text-[#e6c84a] sm:text-2xl"
                              title={result.msisdn}
                            >
                              {result.msisdn}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-black/35 ${
                            result.price === "Price On Call"
                              ? "bg-[#c9a227] text-black"
                              : "border border-white/12 bg-zinc-950/92 text-[#f2e6a8]"
                          }`}
                          title={result.price}
                        >
                          {result.price}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-700/50 pt-3">
                        <button
                          type="button"
                          onClick={() => void handleCopy(result.msisdn)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-700 bg-black/30 px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-[#FFD700]/35 hover:bg-black/50"
                        >
                          <svg
                            className="h-4 w-4 shrink-0 opacity-90"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </button>

                        <span className="text-xs font-medium text-gray-400">
                          Jazz “Choose Your Number”
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!searchError && !searchLoading && searchResults.length === 0 && (
              <div className="mt-4 text-sm text-gray-400">
                Run a search to see available numbers.
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ChooseYourNumberSection;
