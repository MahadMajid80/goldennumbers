"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { openWhatsApp } from "./utils";

type Package = {
  id: string;
  name: string;
  icon: string;
};

type NumberItem = {
  _id: string;
  number: string;
  price: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  categoryId: Array<{ _id: string; name: string }>;
};

const packages: Package[] = [
  { id: "all", name: "All", icon: "/Icons/Tripple.png" },
  { id: "penta", name: "Penta", icon: "/Icons/Penta.png" },
  { id: "hexa", name: "Hexa", icon: "/Icons/Hexa.png" },
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

const OurPackages = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPackage) {
      fetchNumbers();
    }
  }, [selectedPackage]);

  const fetchNumbers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/numbers");
      const allNumbers = await response.json();
      
      if (allNumbers.error) {
        console.error("Error fetching numbers:", allNumbers.error);
        setNumbers([]);
        return;
      }
      
      const numbers = Array.isArray(allNumbers) ? allNumbers : [];
      
      if (selectedPackage === "all") {
        setNumbers(numbers);
      } else if (selectedPackage === "penta" || selectedPackage === "hexa") {
        const categoryName = selectedPackage === "penta" ? "Penta" : "Hexa";
        const filtered = numbers.filter((num: NumberItem) =>
          num.categoryId?.some((cat) => cat.name === categoryName)
        );
        setNumbers(filtered);
      } else {
        setNumbers([]);
      }
    } catch (error) {
      console.error("Error fetching numbers:", error);
      setNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageClick = (pkgId: string) => {
    if (selectedPackage === pkgId) {
      setSelectedPackage(null);
      setNumbers([]);
    } else {
      setSelectedPackage(pkgId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Our Packages</h2>
        <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
      </div>
      <div className="space-y-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
            <button
              onClick={() => handlePackageClick(pkg.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-750 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image
                    src={pkg.icon}
                    alt={pkg.name}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                  />
                </div>
                <span className="text-white text-lg font-medium">{pkg.name}</span>
              </div>
              <svg
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  selectedPackage === pkg.id ? "rotate-180" : ""
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
            
            {selectedPackage === pkg.id && (
              <div className="px-4 pb-4">
                {loading ? (
                  <div className="text-white text-center py-4">Loading numbers...</div>
                ) : numbers.length === 0 ? (
                  <div className="text-white text-center py-4">No numbers available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {numbers.map((item) => (
                      <div
                        key={item._id}
                        className="bg-gray-900 rounded-lg p-4 border-2 border-[#FFD700] hover:shadow-2xl hover:scale-105 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <Image
                            src={getNetworkLogo(item.network)}
                            alt={item.network}
                            width={60}
                            height={30}
                            className="object-contain h-10"
                          />
                        </div>
                        <div className="mb-3">
                          <p className="text-xl font-bold text-[#FFD700]">{item.number}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold text-gray-300">
                            {item.price}
                          </span>
                          <button 
                            onClick={openWhatsApp}
                            className="bg-[#FFD700] text-black px-4 py-2 rounded-full font-semibold hover:bg-[#FFA500] transition-colors"
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
        ))}
      </div>
    </div>
  );
};

export default OurPackages;

