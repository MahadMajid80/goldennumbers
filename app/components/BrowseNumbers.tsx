"use client";

import { useState } from "react";
import { openDialer } from "./utils";

type CategoryCard = {
  id: string;
  label: string;
};

type NetworkId = "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";

type NumberItem = {
  _id: string;
  number: string;
  price: string;
  network: NetworkId;
};

type BrowseTab = "category" | "network";

const networks: readonly { id: NetworkId; label: string }[] = [
  { id: "Jazz", label: "Jazz" },
  { id: "Zong", label: "Zong" },
  { id: "Ufone", label: "Ufone" },
  { id: "Telenor", label: "Telenor" },
] as const;

type CategoryApiItem = {
  _id: string;
  name: string;
};

const categories: CategoryCard[] = [
  { id: "triple", label: "Triple" },
  { id: "hexa", label: "Hexa" },
  { id: "uan", label: "UAN" },
  { id: "triplets", label: "Triplets" },
  { id: "tetra", label: "Tetra" },
  { id: "all-digit", label: "All Digit" },
  { id: "golden", label: "Golden" },
  { id: "penta", label: "Penta" },
  { id: "786", label: "786" },
  { id: "master-code", label: "Master Code" },
  { id: "silver", label: "Silver" },
];

const categoryAliasesById: Record<string, string[]> = {
  "all-digit": ["0300", "all digit", "all-digits", "all digit numbers"],
  uan: ["uan", "golden"],
  silver: ["0321", "silver", "silver numbers"],
};

const BrowseNumberCard = ({ item }: { item: NumberItem }) => (
  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#FFD700] hover:shadow-2xl">
    <div className="mb-2">
      <span className="inline-block rounded-full bg-gray-700 px-2 py-1 text-xs font-semibold text-gray-300">
        {item.network}
      </span>
    </div>
    <p className="mb-2 text-xl font-bold text-[#FFD700]">{item.number}</p>
    <div className="mt-3 flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-gray-300">{item.price}</p>
      <button
        type="button"
        onClick={() => openDialer()}
        className="rounded-full bg-[#FFD700] px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-[#FFA500]"
      >
        Buy Now
      </button>
    </div>
  </div>
);

const BrowseNumbers = () => {
  const [activeTab, setActiveTab] = useState<BrowseTab>("category");
  const [categoryApiItems, setCategoryApiItems] = useState<CategoryApiItem[]>(
    [],
  );
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<
    string | null
  >(null);
  const [categoryNumbers, setCategoryNumbers] = useState<NumberItem[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId | null>(
    null,
  );
  const [networkNumbers, setNetworkNumbers] = useState<NumberItem[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const normalizeCategoryName = (name: string): string =>
    name.trim().toLowerCase().replace(/\s+/g, " ");

  const getCategoryMatchCandidates = (category: CategoryCard): string[] => {
    const aliasCandidates = categoryAliasesById[category.id] ?? [];
    return [category.label, ...aliasCandidates];
  };

  const ensureCategoriesLoaded = async (): Promise<CategoryApiItem[]> => {
    if (categoryApiItems.length > 0) {
      return categoryApiItems;
    }

    const response = await fetch("/api/categories");
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
      console.error(
        "Error fetching categories:",
        errorData.error,
        errorData.details ? `Details: ${errorData.details}` : "",
      );
      throw new Error("Unable to load categories.");
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid categories response.");
    }

    const items = data
      .map((item) => {
        if (
          item &&
          typeof item === "object" &&
          "_id" in item &&
          "name" in item &&
          typeof (item as { _id?: unknown })._id === "string" &&
          typeof (item as { name?: unknown }).name === "string"
        ) {
          return {
            _id: (item as { _id: string })._id,
            name: (item as { name: string }).name,
          };
        }
        return null;
      })
      .filter((x): x is CategoryApiItem => x !== null);

    setCategoryApiItems(items);
    return items;
  };

  const fetchNumbersByCategoryId = async (categoryId: string) => {
    try {
      setCategoryLoading(true);
      setCategoryError(null);
      setCategoryNumbers([]);

      const response = await fetch(
        `/api/numbers?category=${encodeURIComponent(categoryId)}`,
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            error: `HTTP ${response.status}: ${response.statusText}`,
          }));
        console.error(
          "Error fetching category numbers:",
          errorData.error,
          errorData.details ? `Details: ${errorData.details}` : "",
        );
        setCategoryError("Unable to load numbers for this category.");
        return;
      }

      const data: unknown = await response.json();
      if (Array.isArray(data)) {
        setCategoryNumbers(data as NumberItem[]);
        return;
      }

      if (data && typeof data === "object" && "error" in data) {
        const err = (data as { error?: unknown; details?: unknown }).error;
        const details = (data as { details?: unknown }).details;
        console.error(
          "Error fetching category numbers:",
          err,
          typeof details === "string" ? `Details: ${details}` : "",
        );
        setCategoryError("Unable to load numbers for this category.");
        return;
      }

      setCategoryNumbers([]);
    } catch (error) {
      console.error("Error fetching category numbers:", error);
      setCategoryError("Unable to load numbers for this category.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchNumbersByNetwork = async (network: NetworkId) => {
    try {
      setNetworkLoading(true);
      setNetworkError(null);
      setNetworkNumbers([]);

      const response = await fetch(
        `/api/numbers?network=${encodeURIComponent(network)}`,
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            error: `HTTP ${response.status}: ${response.statusText}`,
          }));
        console.error(
          "Error fetching network numbers:",
          errorData.error,
          errorData.details ? `Details: ${errorData.details}` : "",
        );
        setNetworkError("Unable to load numbers for this network.");
        return;
      }

      const data: unknown = await response.json();
      if (Array.isArray(data)) {
        setNetworkNumbers(data as NumberItem[]);
        return;
      }

      if (data && typeof data === "object" && "error" in data) {
        const err = (data as { error?: unknown; details?: unknown }).error;
        const details = (data as { details?: unknown }).details;
        console.error(
          "Error fetching network numbers:",
          err,
          typeof details === "string" ? `Details: ${details}` : "",
        );
        setNetworkError("Unable to load numbers for this network.");
        return;
      }

      setNetworkNumbers([]);
    } catch (error) {
      console.error("Error fetching network numbers:", error);
      setNetworkError("Unable to load numbers for this network.");
    } finally {
      setNetworkLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <div className="inline-block">
          <h2 className="text-2xl font-bold text-white mb-2">Browse Numbers</h2>
          <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
        </div>
      </div>

      <div
        className="mb-6 flex justify-center gap-2 rounded-xl border border-gray-700/80 bg-gray-900/40 p-1 sm:mx-auto sm:max-w-md"
        role="tablist"
        aria-label="Browse by category or network"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "category"}
          onClick={() => setActiveTab("category")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all sm:text-base ${
            activeTab === "category"
              ? "bg-[#FFD700] text-black shadow-md"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
        >
          Category
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "network"}
          onClick={() => setActiveTab("network")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all sm:text-base ${
            activeTab === "network"
              ? "bg-[#FFD700] text-black shadow-md"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
        >
          Network
        </button>
      </div>

      <div className="mb-6">
        {activeTab === "category" && (
          <>
            <div className="mb-6 grid grid-cols-4 gap-3 sm:gap-4">
              {categories.map((category) => {
                const isSelected =
                  selectedCategoryLabel !== null &&
                  normalizeCategoryName(selectedCategoryLabel) ===
                    normalizeCategoryName(category.label);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={async () => {
                      try {
                        setSelectedCategoryLabel(category.label);
                        const apiCats = await ensureCategoriesLoaded();
                        const normalizedCandidates = getCategoryMatchCandidates(
                          category,
                        ).map(normalizeCategoryName);
                        const match = apiCats.find((c) =>
                          normalizedCandidates.includes(
                            normalizeCategoryName(c.name),
                          ),
                        );

                        if (!match) {
                          setCategoryNumbers([]);
                          setCategoryError(
                            `Category "${category.label}" not found in database.`,
                          );
                          return;
                        }

                        await fetchNumbersByCategoryId(match._id);
                      } catch (e) {
                        console.error("Category click failed:", e);
                        setCategoryNumbers([]);
                        setCategoryError("Unable to load this category.");
                      }
                    }}
                    className={`flex min-h-[4.5rem] flex-col items-center justify-center rounded-lg border bg-gray-800 px-2 py-4 shadow-lg transition-all duration-300 hover:bg-gray-750 sm:min-h-[5.5rem] sm:px-3 sm:py-6 ${
                      isSelected
                        ? "border-[#FFD700] ring-1 ring-[#FFD700]/40"
                        : "border-gray-700 hover:border-[#FFD700]/70"
                    }`}
                  >
                    <span className="text-center text-[0.65rem] font-bold uppercase leading-tight tracking-wide text-[#e6c84a] sm:text-xs md:text-sm">
                      {category.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedCategoryLabel && (
              <div className="mt-4">
                {categoryLoading && (
                  <div className="py-4 text-center text-white">
                    Loading {selectedCategoryLabel} numbers...
                  </div>
                )}
                {!categoryLoading && categoryError && (
                  <div className="py-4 text-center text-sm text-red-400">
                    {categoryError}
                  </div>
                )}
                {!categoryLoading &&
                  !categoryError &&
                  categoryNumbers.length === 0 && (
                    <div className="py-4 text-center text-white">
                      No numbers found for {selectedCategoryLabel}.
                    </div>
                  )}
                {!categoryLoading &&
                  !categoryError &&
                  categoryNumbers.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categoryNumbers.map((item) => (
                        <BrowseNumberCard key={item._id} item={item} />
                      ))}
                    </div>
                  )}
              </div>
            )}
          </>
        )}

        {activeTab === "network" && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {networks.map((net) => {
                const isSelected = selectedNetwork === net.id;
                return (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => {
                      setSelectedNetwork(net.id);
                      void fetchNumbersByNetwork(net.id);
                    }}
                    className={`flex min-h-[4.5rem] flex-col items-center justify-center rounded-lg border bg-gray-800 px-2 py-4 shadow-lg transition-all duration-300 hover:bg-gray-750 sm:min-h-[5.5rem] sm:px-3 sm:py-6 ${
                      isSelected
                        ? "border-[#FFD700] ring-1 ring-[#FFD700]/40"
                        : "border-gray-700 hover:border-[#FFD700]/70"
                    }`}
                  >
                    <span className="text-center text-xs font-bold uppercase tracking-wide text-[#e6c84a] sm:text-sm">
                      {net.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedNetwork && (
              <div className="mt-4">
                {networkLoading && (
                  <div className="py-4 text-center text-white">
                    Loading {selectedNetwork} numbers...
                  </div>
                )}
                {!networkLoading && networkError && (
                  <div className="py-4 text-center text-sm text-red-400">
                    {networkError}
                  </div>
                )}
                {!networkLoading &&
                  !networkError &&
                  networkNumbers.length === 0 && (
                    <div className="py-4 text-center text-white">
                      No numbers found for {selectedNetwork}.
                    </div>
                  )}
                {!networkLoading &&
                  !networkError &&
                  networkNumbers.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {networkNumbers.map((item) => (
                        <BrowseNumberCard key={item._id} item={item} />
                      ))}
                    </div>
                  )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseNumbers;
