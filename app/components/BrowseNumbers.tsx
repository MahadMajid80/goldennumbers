"use client";

import { useState } from "react";
import { openDialer } from "./utils";

type CategoryCard = {
  id: string;
  label: string;
};

type NumberItem = {
  _id: string;
  number: string;
  price: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
};

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

const BrowseNumbers = () => {
  const [categoryApiItems, setCategoryApiItems] = useState<CategoryApiItem[]>(
    [],
  );
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<
    string | null
  >(null);
  const [categoryNumbers, setCategoryNumbers] = useState<NumberItem[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <div className="inline-block">
          <h2 className="text-2xl font-bold text-white mb-2">Browse Numbers</h2>
          <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
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
                className={`rounded-lg border bg-gray-800 px-2 py-4 sm:px-3 sm:py-6 flex flex-col items-center justify-center min-h-[4.5rem] sm:min-h-[5.5rem] transition-all duration-300 shadow-lg hover:bg-gray-750 ${
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
              <div className="text-white text-center py-4">
                Loading {selectedCategoryLabel} numbers...
              </div>
            )}
            {!categoryLoading && categoryError && (
              <div className="text-red-400 text-center py-4 text-sm">
                {categoryError}
              </div>
            )}
            {!categoryLoading &&
              !categoryError &&
              categoryNumbers.length === 0 && (
                <div className="text-white text-center py-4">
                  No numbers found for {selectedCategoryLabel}.
                </div>
              )}
            {!categoryLoading &&
              !categoryError &&
              categoryNumbers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryNumbers.map((item) => (
                    <div
                      key={item._id}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-[#FFD700] hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="mb-2">
                        <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                          {item.network}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-[#FFD700] mb-2">
                        {item.number}
                      </p>
                      <div className="flex items-center justify-between gap-3 mt-3">
                        <p className="text-sm font-semibold text-gray-300">
                          {item.price}
                        </p>
                        <button
                          type="button"
                          onClick={() => openDialer()}
                          className="bg-[#FFD700] text-black px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#FFA500] transition-colors"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseNumbers;
