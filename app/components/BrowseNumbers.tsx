"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type FilterType = "Category" | "Budget" | "Network";

type CategoryCard = {
  id: string;
  icon: string;
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
  { id: "triple", icon: "/Icons 2/Tripple.png", label: "Triple" },
  { id: "hexa", icon: "/Icons 2/Hexa.png", label: "Hexa" },
  { id: "uan", icon: "/Icons 2/UAN.png", label: "UAN" },
  { id: "triplets", icon: "/Icons 2/Triplet.png", label: "Triplets" },
  { id: "tetra", icon: "/Icons 2/Tetra.png", label: "Tetra" },
  { id: "hepta", icon: "/Icons 2/Hepta.png", label: "Hepta" },
  { id: "all-digit", icon: "/Icons 2/0300.png", label: "All Digit" },
  { id: "golden", icon: "/Icons 2/UAN.png", label: "Golden" },
  { id: "penta", icon: "/Icons 2/Penta.png", label: "Penta" },
  { id: "786", icon: "/Icons 2/786.png", label: "786" },
  { id: "master-code", icon: "/Icons 2/Master code.png", label: "Master Code" },
  { id: "silver", icon: "/Icons 2/0321.png", label: "Silver" },
];

const getNetworkLogo = (network: string) => {
  const logos: Record<string, string> = {
    Jazz: "/jazz-logo.png",
    Ufone: "/ufone-logo (1).png",
    Telenor: "/telenor-logo-icon (3).png",
    Warid: "/596_warid_telecom_logo-Photoroom (1).png",
    Zong: "/zong-logo (1).png",
  };
  return logos[network] || "/jazz-logo.png";
};

const BrowseNumbers = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Category");
  const [currentPage, setCurrentPage] = useState(1);
  const [minBudget, setMinBudget] = useState(20);
  const [maxBudget, setMaxBudget] = useState(80);
  const [budgetNumbers, setBudgetNumbers] = useState<NumberItem[]>([]);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [categoryApiItems, setCategoryApiItems] = useState<CategoryApiItem[]>([]);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string | null>(null);
  const [categoryNumbers, setCategoryNumbers] = useState<NumberItem[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const minRangeRef = useRef<HTMLInputElement>(null);
  const maxRangeRef = useRef<HTMLInputElement>(null);

  const filters: FilterType[] = ["Category", "Budget", "Network"];
  const networks = ["Jazz", "Zong", "Ufone", "Telenor"];

  const budgetToPrice = (value: number): number =>
    Math.round((value / 100) * 1_000_000);

  const formatPrice = (value: number): string =>
    value.toLocaleString("en-PK", { maximumFractionDigits: 0 });

  const normalizeCategoryName = (name: string): string =>
    name.trim().toLowerCase().replace(/\s+/g, " ");

  const ensureCategoriesLoaded = async (): Promise<CategoryApiItem[]> => {
    if (categoryApiItems.length > 0) {
      return categoryApiItems;
    }

    const response = await fetch("/api/categories");
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
      console.error(
        "Error fetching categories:",
        errorData.error,
        errorData.details ? `Details: ${errorData.details}` : ""
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
          return { _id: (item as { _id: string })._id, name: (item as { name: string }).name };
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

      const response = await fetch(`/api/numbers?category=${encodeURIComponent(categoryId)}`);
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        console.error(
          "Error fetching category numbers:",
          errorData.error,
          errorData.details ? `Details: ${errorData.details}` : ""
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
          typeof details === "string" ? `Details: ${details}` : ""
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

  const handleMinChange = (value: number) => {
    if (value <= maxBudget) {
      setMinBudget(value);
    }
  };

  const handleMaxChange = (value: number) => {
    if (value >= minBudget) {
      setMaxBudget(value);
    }
  };

  useEffect(() => {
    if (activeFilter !== "Budget") {
      return;
    }

    const fetchBudgetNumbers = async () => {
      try {
        setBudgetLoading(true);
        setBudgetError(null);

        const minPrice = budgetToPrice(minBudget);
        const maxPrice = budgetToPrice(maxBudget);

        const response = await fetch(
          `/api/numbers?minPrice=${minPrice}&maxPrice=${maxPrice}`
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({
              error: `HTTP ${response.status}: ${response.statusText}`,
            }));
          console.error(
            "Error fetching budget numbers:",
            errorData.error,
            errorData.details ? `Details: ${errorData.details}` : ""
          );
          setBudgetNumbers([]);
          setBudgetError("Unable to load numbers for this budget range.");
          return;
        }

        const data = await response.json();
        if (data.error) {
          console.error(
            "Error fetching budget numbers:",
            data.error,
            data.details ? `Details: ${data.details}` : ""
          );
          setBudgetNumbers([]);
          setBudgetError("Unable to load numbers for this budget range.");
        } else {
          setBudgetNumbers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching budget numbers:", error);
        setBudgetNumbers([]);
        setBudgetError("Unable to load numbers for this budget range.");
      } finally {
        setBudgetLoading(false);
      }
    };

    fetchBudgetNumbers();
  }, [activeFilter, minBudget, maxBudget]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="inline-block">
          <h2 className="text-2xl font-bold text-white mb-2">Browse Numbers</h2>
          <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                activeFilter === filter
                  ? "bg-[#FFD700] text-black shadow-lg"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {activeFilter === "Budget" && (
        <div className="mb-8">
          <h3 className="text-white text-lg font-semibold mb-6">Budget Range</h3>
          
          <div className="relative mb-6">
            <div className="relative h-2 bg-gray-700 rounded-full">
              <div
                className="absolute h-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full"
                style={{
                  left: `${minBudget}%`,
                  width: `${maxBudget - minBudget}%`,
                }}
              ></div>
              
              <div className="absolute flex justify-between w-full -bottom-6">
                <span className="text-white text-sm">
                  Rs {formatPrice(budgetToPrice(minBudget))}
                </span>
                <span className="text-white text-sm">
                  Rs {formatPrice(budgetToPrice(maxBudget))}
                </span>
              </div>
            </div>
            
            <div className="relative mt-8">
              <div className="relative w-full">
                <input
                  ref={minRangeRef}
                  type="range"
                  min="0"
                  max="100"
                  value={minBudget}
                  onChange={(e) => handleMinChange(Number(e.target.value))}
                  onPointerDown={() => {
                    if (minRangeRef.current) minRangeRef.current.style.zIndex = "30";
                    if (maxRangeRef.current) maxRangeRef.current.style.zIndex = "20";
                  }}
                  onMouseDown={() => {
                    if (minRangeRef.current) minRangeRef.current.style.zIndex = "30";
                    if (maxRangeRef.current) maxRangeRef.current.style.zIndex = "20";
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                />
                <input
                  ref={maxRangeRef}
                  type="range"
                  min="0"
                  max="100"
                  value={maxBudget}
                  onChange={(e) => handleMaxChange(Number(e.target.value))}
                  onPointerDown={() => {
                    if (maxRangeRef.current) maxRangeRef.current.style.zIndex = "30";
                    if (minRangeRef.current) minRangeRef.current.style.zIndex = "20";
                  }}
                  onMouseDown={() => {
                    if (maxRangeRef.current) maxRangeRef.current.style.zIndex = "30";
                    if (minRangeRef.current) minRangeRef.current.style.zIndex = "20";
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-30 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-18">
              <div className="flex items-center gap-2">
                <span className="text-white">From</span>
                <input
                  type="number"
                  value={budgetToPrice(minBudget)}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    if (Number.isNaN(raw) || raw < 0) return;
                    const percentage = Math.min(
                      100,
                      Math.max(0, (raw / 1_000_000) * 100)
                    );
                    if (percentage <= maxBudget) {
                      setMinBudget(percentage);
                    }
                  }}
                  min="0"
                  max={budgetToPrice(maxBudget)}
                  className="w-32 px-3 py-2 bg-white border border-black rounded text-black focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white">To</span>
                <input
                  type="number"
                  value={budgetToPrice(maxBudget)}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    if (Number.isNaN(raw) || raw < 0) return;
                    const percentage = Math.min(
                      100,
                      Math.max(0, (raw / 1_000_000) * 100)
                    );
                    if (percentage >= minBudget) {
                      setMaxBudget(percentage);
                    }
                  }}
                  min={budgetToPrice(minBudget)}
                  max={1_000_000}
                  className="w-32 px-3 py-2 bg-white border border-black rounded text-black focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            {budgetLoading && (
              <div className="text-white text-center py-4">
                Loading numbers for this budget...
              </div>
            )}
            {!budgetLoading && budgetError && (
              <div className="text-red-400 text-center py-4 text-sm">
                {budgetError}
              </div>
            )}
            {!budgetLoading && !budgetError && budgetNumbers.length === 0 && (
              <div className="text-white text-center py-4">
                No numbers found in this budget range.
              </div>
            )}
            {!budgetLoading && !budgetError && budgetNumbers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {budgetNumbers.map((item) => (
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
                    <p className="text-sm font-semibold text-gray-300">
                      {item.price}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeFilter === "Network" && (
        <div className="mb-8">
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-2">Network</h3>
            <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {networks.map((network) => (
              <button
                key={network}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-all duration-300 shadow-lg border border-gray-700 hover:border-[#FFD700] group"
              >
                <div className="h-32 bg-black flex items-center justify-center">
                  <Image
                    src={getNetworkLogo(network)}
                    alt={network}
                    width={120}
                    height={60}
                    className="object-contain h-16 opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="p-4">
                  <div className="w-full bg-white text-black px-4 py-2 rounded-lg font-bold text-center">
                    {network.toUpperCase()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeFilter === "Category" && (
        <div className="mb-6">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
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
                      const match = apiCats.find(
                        (c) =>
                          normalizeCategoryName(c.name) ===
                          normalizeCategoryName(category.label)
                      );

                      if (!match) {
                        setCategoryNumbers([]);
                        setCategoryError(
                          `Category "${category.label}" not found in database.`
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
                  className={`bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:bg-gray-750 transition-all duration-300 shadow-lg border group ${
                    isSelected
                      ? "border-[#FFD700]"
                      : "border-gray-700 hover:border-[#FFD700]"
                  }`}
                >
                  <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={category.icon}
                      alt={category.label}
                      width={64}
                      height={64}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-300">
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
                        <p className="text-sm font-semibold text-gray-300">
                          {item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentPage === page
                ? "bg-[#FFD700] w-6"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BrowseNumbers;

