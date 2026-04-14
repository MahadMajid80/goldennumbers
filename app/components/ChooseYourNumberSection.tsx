"use client";

import { useEffect, useMemo, useState } from "react";

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
          Array.isArray(data.prefixesForCriteria) ? data.prefixesForCriteria : [],
        );
        setCriteriaOptions(Array.isArray(data.criteria) ? data.criteria : []);

        if (Array.isArray(data.prefixesForType) && data.prefixesForType.length > 0) {
          setSelectedTypePrefix(data.prefixesForType[0].value);
        }

        if (
          Array.isArray(data.prefixesForCriteria) &&
          data.prefixesForCriteria.length > 0
        ) {
          const allOption = data.prefixesForCriteria.find((p) => p.value === "03**");
          setSelectedCriteriaPrefix(
            allOption?.value ?? data.prefixesForCriteria[0].value,
          );
        }

        if (Array.isArray(data.criteria) && data.criteria.length > 0) {
          const allSeven = data.criteria.find((c) => c.value === "ALLSEVENDIGITS");
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

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="rounded-xl border border-[#FFD700]/45 bg-zinc-950/25 p-4 shadow-[inset_0_1px_0_0_rgba(255,215,0,0.06)] md:p-6">
        <div className="mb-6 text-center">
          <div className="inline-block">
            <h2 className="mb-2 text-2xl font-bold text-white">Choose Your Number</h2>
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
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {mode === "type" ? (
                <>
                  <label className="flex flex-col gap-1">
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
                  <label className="flex flex-col gap-1">
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
                </>
              ) : (
                <>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                      Prefix
                    </span>
                    <select
                      value={selectedCriteriaPrefix}
                      onChange={(e) => setSelectedCriteriaPrefix(e.target.value)}
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
              )}
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

            {searchError && (
              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/20 p-3 text-sm text-red-300">
                {searchError}
              </div>
            )}

            {!searchError && !searchLoading && searchResults.length > 0 && (
              <div className="mt-5 overflow-hidden rounded-xl border border-gray-700/70">
                <div className="grid grid-cols-2 bg-gray-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-300 md:grid-cols-[1fr_220px]">
                  <span>Available Number</span>
                  <span className="text-right">Price</span>
                </div>
                <div className="divide-y divide-gray-800">
                  {searchResults.map((result) => (
                    <div
                      key={`${result.msisdn}-${result.price}`}
                      className="grid grid-cols-2 items-center px-4 py-3 text-sm md:grid-cols-[1fr_220px]"
                    >
                      <span className="font-semibold text-[#e6c84a]">{result.msisdn}</span>
                      <span className="text-right text-white">{result.price}</span>
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
