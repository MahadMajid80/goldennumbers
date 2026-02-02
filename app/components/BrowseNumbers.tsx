"use client";

import { useState } from "react";
import Image from "next/image";

type FilterType = "Category" | "Budget" | "Network";

type CategoryCard = {
  id: string;
  icon: string;
  label: string;
};

const categories: CategoryCard[] = [
  { id: "triple", icon: "/Icons/Tripple.png", label: "Triple" },
  { id: "hexa", icon: "/Icons/Hexa.png", label: "Hexa" },
  { id: "uan", icon: "/Icons/UAN.png", label: "UAN" },
  { id: "triplets", icon: "/Icons/Triplet.png", label: "Triplets" },
  { id: "tetra", icon: "/Icons/Tetra.png", label: "Tetra" },
  { id: "hepta", icon: "/Icons/Hepta.png", label: "Hepta" },
  { id: "all-digit", icon: "/Icons/0300.png", label: "All Digit" },
  { id: "golden", icon: "/Icons/UAN.png", label: "Golden" },
  { id: "penta", icon: "/Icons/Penta.png", label: "Penta" },
  { id: "786", icon: "/Icons/786.png", label: "786" },
  { id: "master-code", icon: "/Icons/Master code.png", label: "Master Code" },
  { id: "silver", icon: "/Icons/0321.png", label: "Silver" },
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

  const filters: FilterType[] = ["Category", "Budget", "Network"];
  const networks = ["Jazz", "Zong", "Ufone", "Telenor"];

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Browse Numbers</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
          {(activeFilter === "Category" || activeFilter === "Network") && (
            <div className="w-8 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
          )}
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
                  left: `${(minBudget / 100) * 100}%`,
                  width: `${((maxBudget - minBudget) / 100) * 100}%`,
                }}
              ></div>
              
              <div className="absolute flex justify-between w-full -bottom-6">
                <span className="text-white text-sm">{minBudget}</span>
                <span className="text-white text-sm">{maxBudget}</span>
              </div>
            </div>
            
            <div className="relative mt-8">
              <div className="relative w-full">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minBudget}
                  onChange={(e) => handleMinChange(Number(e.target.value))}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={maxBudget}
                  onChange={(e) => handleMaxChange(Number(e.target.value))}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <div className="flex items-center gap-2">
                <span className="text-white">From</span>
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 0 && val <= maxBudget) {
                      setMinBudget(val);
                    }
                  }}
                  min="0"
                  max={maxBudget}
                  className="w-20 px-3 py-2 bg-white border border-black rounded text-black focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white">To</span>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= minBudget && val <= 100) {
                      setMaxBudget(val);
                    }
                  }}
                  min={minBudget}
                  max="100"
                  className="w-20 px-3 py-2 bg-white border border-black rounded text-black focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                />
              </div>
            </div>
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
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:bg-gray-750 transition-all duration-300 shadow-lg border border-gray-700 hover:border-[#FFD700] group"
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
            </button>
          ))}
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

