"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { openWhatsApp } from "./utils";

type PremiumNumber = {
  _id: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  number: string;
  price: string;
  categoryId: Array<{ _id: string; name: string }>;
};

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

const PremiumNumbersTable = () => {
  const [premiumNumbers, setPremiumNumbers] = useState<PremiumNumber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPremiumNumbers();
  }, []);

  const fetchPremiumNumbers = async () => {
    try {
      const response = await fetch("/api/numbers?premiumNumber=true");
      const data = await response.json();
      if (data.error) {
        console.error("Error fetching premium numbers:", data.error);
        setPremiumNumbers([]);
      } else {
        setPremiumNumbers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching premium numbers:", error);
      setPremiumNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Premium Numbers Available
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
        </div>
        <div className="text-white text-center">Loading premium numbers...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Premium Numbers Available
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
      </div>

      {premiumNumbers.length === 0 ? (
        <div className="text-white text-center py-12">
          No premium numbers available
        </div>
      ) : (
        <div>
          {premiumNumbers.length > 8 ? (
            <div
              className="max-h-[500px] md:max-h-[450px] overflow-y-auto overflow-x-hidden pr-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#4B5563 #1F2937",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {premiumNumbers.map((num, index) => (
                  <div
                    key={num._id}
                    className="bg-gray-800 rounded-lg p-6 border-2 border-[#FFD700] shadow-lg hover:shadow-2xl hover:scale-[1.02] active:shadow-2xl active:scale-[1.02] transition-all duration-300 cursor-pointer group animate-fade-in"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                        <div className="flex-shrink-0">
                          <Image
                            src={getNetworkLogo(num.network)}
                            alt={num.network}
                            width={80}
                            height={40}
                            className="object-contain h-12 group-hover:scale-110 group-active:scale-110 transition-transform duration-300"
                          />
                          {num.network === "Ufone" && (
                            <p className="text-xs text-gray-400 mt-1 text-center">
                              it&apos;s all about u
                            </p>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-2xl font-bold text-[#FFD700] group-hover:text-[#FFA500] group-active:text-[#FFA500] transition-colors duration-300">
                            {num.number}
                          </p>
                          {num.categoryId && num.categoryId.length > 0 && (
                            <span className="inline-block mt-2 text-sm font-bold text-gray-300">
                              {num.categoryId.map((cat) => cat.name).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                        {num.price === "Price On Call" ? (
                          <button 
                            onClick={openWhatsApp}
                            className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 active:bg-gray-800 transition-all duration-300 flex items-center gap-2 group-hover:scale-105 active:scale-105 shadow-lg"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span>Price On Call</span>
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={openWhatsApp}
                              className="bg-[#FFD700] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#FFA500] active:bg-[#FFA500] transition-all duration-300 group-hover:scale-105 active:scale-105 shadow-lg"
                            >
                              Buy Now
                            </button>
                            <span className="text-lg font-semibold text-gray-300">
                              {num.price}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumNumbers.map((num, index) => (
                <div
                  key={num._id}
                  className="bg-gray-800 rounded-lg p-6 border-2 border-[#FFD700] shadow-lg hover:shadow-2xl hover:scale-[1.02] active:shadow-2xl active:scale-[1.02] transition-all duration-300 cursor-pointer group animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                <div className="flex-shrink-0">
                  <Image
                    src={getNetworkLogo(num.network)}
                    alt={num.network}
                    width={80}
                    height={40}
                    className="object-contain h-12 group-hover:scale-110 transition-transform duration-300"
                  />
                  {num.network === "Ufone" && (
                    <p className="text-xs text-gray-400 mt-1 text-center">
                      it&apos;s all about u
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-[#FFD700] group-hover:text-[#FFA500] transition-colors duration-300">
                    {num.number}
                  </p>
                      {num.categoryId && num.categoryId.length > 0 && (
                  <span className="inline-block mt-2 text-sm font-bold text-gray-300">
                          {num.categoryId.map((cat) => cat.name).join(", ")}
                  </span>
                      )}
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                {num.price === "Price On Call" ? (
                  <button 
                    onClick={openWhatsApp}
                    className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 group-hover:scale-105 shadow-lg"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>Price On Call</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={openWhatsApp}
                      className="bg-[#FFD700] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#FFA500] transition-all duration-300 group-hover:scale-105 shadow-lg"
                    >
                      Buy Now
                    </button>
                    <span className="text-lg font-semibold text-gray-300">
                      {num.price}
                    </span>
                  </>
                )}
              </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumNumbersTable;
