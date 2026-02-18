"use client";

import { useState, useEffect, useRef } from "react";

type NumberItem = {
  _id: string;
  number: string;
  price: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
};

type SearchBannerProps = {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  selectedNetwork?: string | null;
  setSelectedNetwork?: (network: string | null) => void;
  minPrice?: string;
  setMinPrice?: (price: string) => void;
  maxPrice?: string;
  setMaxPrice?: (price: string) => void;
};

const SearchBanner = ({
  searchTerm: externalSearchTerm,
  setSearchTerm: externalSetSearchTerm,
  selectedNetwork: externalSelectedNetwork,
  setSelectedNetwork: externalSetSelectedNetwork,
  minPrice: externalMinPrice,
  setMinPrice: externalSetMinPrice,
  maxPrice: externalMaxPrice,
  setMaxPrice: externalSetMaxPrice,
}: SearchBannerProps) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalSelectedNetwork, setInternalSelectedNetwork] = useState<
    string | null
  >(null);
  const [internalMinPrice, setInternalMinPrice] = useState("");
  const [internalMaxPrice, setInternalMaxPrice] = useState("");

  const searchTerm = externalSearchTerm ?? internalSearchTerm;
  const setSearchTerm = externalSetSearchTerm ?? setInternalSearchTerm;
  const selectedNetwork = externalSelectedNetwork ?? internalSelectedNetwork;
  const setSelectedNetwork =
    externalSetSelectedNetwork ?? setInternalSelectedNetwork;
  const minPrice = externalMinPrice ?? internalMinPrice;
  const setMinPrice = externalSetMinPrice ?? setInternalMinPrice;
  const maxPrice = externalMaxPrice ?? internalMaxPrice;
  const setMaxPrice = externalSetMaxPrice ?? setInternalMaxPrice;

  const [priceRange, setPriceRange] = useState("Price Range");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<NumberItem[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [allNumbers, setAllNumbers] = useState<NumberItem[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const networkDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNumbers();
  }, []);

  useEffect(() => {
    if (searchTerm && searchTerm.trim().length > 0) {
      const filtered = allNumbers
        .filter((num) =>
          num.number.toLowerCase().includes(searchTerm.toLowerCase().trim())
        )
        .slice(0, 5);
      setSearchSuggestions(filtered);
      setShowSearchDropdown(filtered.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSearchDropdown(false);
    }
  }, [searchTerm, allNumbers]);

  const fetchNumbers = async () => {
    try {
      const response = await fetch("/api/numbers");
      const data = await response.json();
      if (data.error) {
        console.error("Error fetching numbers:", data.error);
        setAllNumbers([]);
      } else {
        setAllNumbers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching numbers:", error);
      setAllNumbers([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        networkDropdownRef.current &&
        !networkDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNetworkDropdown(false);
      }
      if (
        priceDropdownRef.current &&
        !priceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPriceDropdown(false);
      }
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const networks = [
    "All Networks",
    "Jazz",
    "Ufone",
    "Telenor",
    "Warid",
    "Zong",
  ];
  const priceRanges = [
    "Price Range",
    "Under 50,000",
    "50,000 - 100,000",
    "100,000 - 200,000",
    "200,000 - 500,000",
    "500,000 - 1,000,000",
    "Above 1,000,000",
  ];

  return (
    <div className="container mx-auto px-4 py-4 pb-2">
      <div className="bg-gray-800 rounded-lg shadow-lg flex items-center border border-gray-700 relative overflow-visible">
        <div className="flex-1 flex items-center md:divide-x divide-gray-700">
          {/* Search Input - Always visible */}
          <div
            className="relative flex-1 px-4 py-3 z-50"
            ref={searchDropdownRef}
          >
            <input
              type="text"
              placeholder="Search your dream number"
              value={searchTerm || ""}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => {
                if (searchSuggestions.length > 0) {
                  setShowSearchDropdown(true);
                }
              }}
              className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
            {showSearchDropdown && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl z-[100] max-h-60 overflow-y-auto">
                {searchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion._id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm(suggestion.number);
                      setShowSearchDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 text-white transition-colors block border-b border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{suggestion.number}</span>
                      <span className="text-gray-400 text-sm">
                        {suggestion.price}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.network}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Network Filter - Hidden on mobile */}
          <div
            className="relative flex-1 px-4 py-3 z-50 hidden md:block"
            ref={networkDropdownRef}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowNetworkDropdown(!showNetworkDropdown);
                setShowPriceDropdown(false);
              }}
              className="w-full flex items-center justify-between text-white focus:outline-none"
            >
              <span>{selectedNetwork || "All Networks"}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showNetworkDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showNetworkDropdown && (
              <div className="absolute top-full left-0 w-full mt-1 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl z-[100] max-h-60 overflow-y-auto">
                {networks.length > 0 ? (
                  networks.map((network) => (
                    <button
                      key={network}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (network === "All Networks") {
                          setSelectedNetwork(null);
                        } else {
                          setSelectedNetwork(network);
                        }
                        setShowNetworkDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 text-white transition-colors whitespace-nowrap block"
                    >
                      {network}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-white">
                    No networks available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price Filter - Hidden on mobile */}
          <div
            className="relative flex-1 px-4 py-3 z-50 hidden md:block"
            ref={priceDropdownRef}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPriceDropdown(!showPriceDropdown);
                setShowNetworkDropdown(false);
              }}
              className="w-full flex items-center justify-between text-white focus:outline-none"
            >
              <span>
                {minPrice && maxPrice
                  ? `${minPrice} - ${maxPrice}`
                  : minPrice
                  ? `Min: ${minPrice}`
                  : maxPrice
                  ? `Max: ${maxPrice}`
                  : priceRange}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showPriceDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showPriceDropdown && (
              <div className="absolute top-full left-0 w-full mt-1 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl z-[100] p-4 min-w-[400px]">
                <div className="mb-4">
                  <div className="relative mb-6">
                    <div className="relative h-2 bg-gray-700 rounded-full">
                      <div
                        className="absolute h-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full"
                        style={{
                          left: `${
                            ((parseInt(minPrice) || 0) / 10000000) * 100
                          }%`,
                          width: `${
                            (((parseInt(maxPrice) || 10000000) -
                              (parseInt(minPrice) || 0)) /
                              10000000) *
                            100
                          }%`,
                        }}
                      ></div>

                      <div className="absolute flex justify-between w-full -bottom-6">
                        <span className="text-white text-sm">
                          {minPrice || "0"}
                        </span>
                        <span className="text-white text-sm">
                          {maxPrice || "10000000"}
                        </span>
                      </div>
                    </div>

                    <div className="relative mt-8">
                      <div className="relative w-full h-2">
                        <input
                          type="range"
                          min="0"
                          max="10000000"
                          step="1000"
                          value={minPrice || "0"}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = e.target.value;
                            const maxVal = parseInt(maxPrice || "10000000");
                            const minVal = parseInt(value);
                            if (minVal <= maxVal) {
                              setMinPrice(value);
                              setPriceRange("Custom Range");
                            }
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            const target = e.currentTarget as HTMLInputElement;
                            target.style.zIndex = "50";
                            const maxInput =
                              target.nextElementSibling as HTMLInputElement;
                            if (maxInput) {
                              maxInput.style.zIndex = "20";
                            }
                          }}
                          onPointerUp={(e) => {
                            const target = e.currentTarget as HTMLInputElement;
                            setTimeout(() => {
                              target.style.zIndex = "20";
                            }, 100);
                          }}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ zIndex: 30 }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="10000000"
                          step="1000"
                          value={maxPrice || "10000000"}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = e.target.value;
                            const minVal = parseInt(minPrice || "0");
                            const maxVal = parseInt(value);
                            if (maxVal >= minVal) {
                              setMaxPrice(value);
                              setPriceRange("Custom Range");
                            }
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            const target = e.currentTarget as HTMLInputElement;
                            target.style.zIndex = "50";
                            const minInput =
                              target.previousElementSibling as HTMLInputElement;
                            if (minInput) {
                              minInput.style.zIndex = "20";
                            }
                          }}
                          onPointerUp={(e) => {
                            const target = e.currentTarget as HTMLInputElement;
                            setTimeout(() => {
                              target.style.zIndex = "20";
                            }, 100);
                          }}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ zIndex: 20 }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <div className="flex items-center gap-2">
                        <label className="text-white text-sm">Min</label>
                        <input
                          type="number"
                          value={minPrice || ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = e.target.value;
                            if (
                              !maxPrice ||
                              !val ||
                              parseInt(val) <= parseInt(maxPrice)
                            ) {
                              setMinPrice(val);
                              setPriceRange("Custom Range");
                            }
                          }}
                          min="0"
                          max={maxPrice || "10000000"}
                          placeholder="0"
                          className="w-24 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD700]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-gray-400 text-sm">Rs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-white text-sm">Max</label>
                        <input
                          type="number"
                          value={maxPrice || ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = e.target.value;
                            if (
                              !minPrice ||
                              !val ||
                              parseInt(val) >= parseInt(minPrice)
                            ) {
                              setMaxPrice(val);
                              setPriceRange("Custom Range");
                            }
                          }}
                          min={minPrice || "0"}
                          max="10000000"
                          placeholder="10000000"
                          className="w-24 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD700]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-gray-400 text-sm">Rs</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPriceRange("Price Range");
                      setMinPrice("");
                      setMaxPrice("");
                      setShowPriceDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white transition-colors whitespace-nowrap block rounded mb-2 border-b border-gray-700 pb-3"
                  >
                    No Filter
                  </button>
                  <div className="text-gray-400 text-xs mb-2 px-1">
                    Or select a range:
                  </div>
                  {priceRanges.slice(1).map((range) => {
                    const parsePriceRange = (rangeStr: string) => {
                      if (rangeStr === "Under 50,000") {
                        return { min: "", max: "50000" };
                      } else if (rangeStr === "Above 1,000,000") {
                        return { min: "1000000", max: "" };
                      } else if (rangeStr.includes(" - ")) {
                        const [min, max] = rangeStr.split(" - ");
                        return {
                          min: min.replace(/[^0-9]/g, ""),
                          max: max.replace(/[^0-9]/g, ""),
                        };
                      }
                      return { min: "", max: "" };
                    };

                    return (
                      <button
                        key={range}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const { min, max } = parsePriceRange(range);
                          setPriceRange(range);
                          setMinPrice(min);
                          setMaxPrice(max);
                          setShowPriceDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white transition-colors whitespace-nowrap block rounded"
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Button - Mobile only */}
        <button
          type="button"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden bg-gray-700 hover:bg-gray-600 px-4 py-3 transition-colors flex items-center justify-center flex-shrink-0 border-l border-gray-700"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>

        {/* Search Button - Always visible */}
        <button
          type="button"
          className="bg-[#FFD700] hover:bg-[#FFA500] px-4 md:px-6 py-3 rounded-r-lg transition-colors flex items-center justify-center flex-shrink-0"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Filters Dropdown */}
      {showMobileFilters && (
        <div className="md:hidden mt-2 bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
          {/* Network Filter */}
          <div className="relative" ref={networkDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowNetworkDropdown(!showNetworkDropdown);
                setShowPriceDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none"
            >
              <span>{selectedNetwork || "All Networks"}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showNetworkDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showNetworkDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl z-[100] max-h-60 overflow-y-auto">
                {networks.map((network) => (
                  <button
                    key={network}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (network === "All Networks") {
                        setSelectedNetwork(null);
                      } else {
                        setSelectedNetwork(network);
                      }
                      setShowNetworkDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 text-white transition-colors whitespace-nowrap block"
                  >
                    {network}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div className="relative" ref={priceDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPriceDropdown(!showPriceDropdown);
                setShowNetworkDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none"
            >
              <span>
                {minPrice && maxPrice
                  ? `${minPrice} - ${maxPrice}`
                  : minPrice
                  ? `Min: ${minPrice}`
                  : maxPrice
                  ? `Max: ${maxPrice}`
                  : priceRange}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showPriceDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showPriceDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl z-[100] p-4">
                <div className="mb-4">
                  <div className="relative mb-6">
                    <div className="relative h-2 bg-gray-700 rounded-full">
                      <div
                        className="absolute h-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full"
                        style={{
                          left: `${
                            ((parseInt(minPrice) || 0) / 10000000) * 100
                          }%`,
                          width: `${
                            (((parseInt(maxPrice) || 10000000) -
                              (parseInt(minPrice) || 0)) /
                              10000000) *
                            100
                          }%`,
                        }}
                      ></div>

                      <div className="absolute flex justify-between w-full -bottom-6">
                        <span className="text-white text-sm">
                          {minPrice || "0"}
                        </span>
                        <span className="text-white text-sm">
                          {maxPrice || "10000000"}
                        </span>
                      </div>
                    </div>

                    <div className="relative mt-8">
                      <div className="relative w-full h-2">
                        <input
                          type="range"
                          min="0"
                          max="10000000"
                          step="1000"
                          value={minPrice || "0"}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = e.target.value;
                            const maxVal = parseInt(maxPrice || "10000000");
                            const minVal = parseInt(value);
                            if (minVal <= maxVal) {
                              setMinPrice(value);
                              setPriceRange("Custom Range");
                            }
                          }}
                          onPointerDown={(e) => {
                            const target = e.currentTarget;
                            target.style.zIndex = "20";
                          }}
                          onPointerUp={(e) => {
                            const target = e.currentTarget;
                            target.style.zIndex = "10";
                          }}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                        />
                        <input
                          type="range"
                          min="0"
                          max="10000000"
                          step="1000"
                          value={maxPrice || "10000000"}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = e.target.value;
                            const minVal = parseInt(minPrice || "0");
                            const maxVal = parseInt(value);
                            if (maxVal >= minVal) {
                              setMaxPrice(value);
                              setPriceRange("Custom Range");
                            }
                          }}
                          onPointerDown={(e) => {
                            const target = e.currentTarget;
                            target.style.zIndex = "20";
                          }}
                          onPointerUp={(e) => {
                            const target = e.currentTarget;
                            target.style.zIndex = "10";
                          }}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <div className="flex items-center gap-2">
                        <span className="text-white">From</span>
                        <input
                          type="number"
                          value={minPrice || ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = e.target.value;
                            const maxVal = parseInt(maxPrice || "10000000");
                            const minVal = parseInt(val) || 0;
                            if (minVal >= 0 && minVal <= maxVal) {
                              setMinPrice(val);
                              setPriceRange("Custom Range");
                            }
                          }}
                          min="0"
                          max={maxPrice || "10000000"}
                          className="w-24 px-3 py-2 bg-white border border-black rounded text-black focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white">To</span>
                        <input
                          type="number"
                          value={maxPrice || ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = e.target.value;
                            const minVal = parseInt(minPrice || "0");
                            const maxVal = parseInt(val) || 10000000;
                            if (maxVal >= minVal && maxVal <= 10000000) {
                              setMaxPrice(val);
                              setPriceRange("Custom Range");
                            }
                          }}
                          min={minPrice || "0"}
                          max="10000000"
                          className="w-24 px-3 py-2 bg-white border border-black rounded text-black focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPriceRange("Price Range");
                      setMinPrice("");
                      setMaxPrice("");
                      setShowPriceDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white transition-colors whitespace-nowrap block rounded mb-2 border-b border-gray-700 pb-3"
                  >
                    No Filter
                  </button>
                  <div className="text-gray-400 text-xs mb-2 px-1">
                    Or select a range:
                  </div>
                  {priceRanges.slice(1).map((range) => {
                    const parsePriceRange = (rangeStr: string) => {
                      if (rangeStr === "Under 50,000") {
                        return { min: "", max: "50000" };
                      } else if (rangeStr === "Above 1,000,000") {
                        return { min: "1000000", max: "" };
                      } else if (rangeStr.includes(" - ")) {
                        const [min, max] = rangeStr.split(" - ");
                        return {
                          min: min.replace(/[^0-9]/g, ""),
                          max: max.replace(/[^0-9]/g, ""),
                        };
                      }
                      return { min: "", max: "" };
                    };

                    return (
                      <button
                        key={range}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const { min, max } = parsePriceRange(range);
                          setPriceRange(range);
                          setMinPrice(min);
                          setMaxPrice(max);
                          setShowPriceDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white transition-colors whitespace-nowrap block rounded"
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBanner;
