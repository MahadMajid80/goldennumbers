"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { openWhatsApp } from "./utils";

type NumberCard = {
  _id: string;
  number: string;
  price: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  limitedOffer?: boolean;
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

const FeaturedNumbersCards = () => {
  const [featuredNumbers, setFeaturedNumbers] = useState<NumberCard[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const originalScrollWidthRef = useRef<number>(0);

  useEffect(() => {
    fetchFeaturedNumbers();
  }, []);

  useEffect(() => {
    if (featuredNumbers.length === 0 || loading) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Store the original scroll width after first render
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const firstSetWidth = scrollContainerRef.current.querySelector("div > div")?.getBoundingClientRect().width || 0;
        const gap = 16;
        originalScrollWidthRef.current = (firstSetWidth + gap) * featuredNumbers.length;
      }
    }, 100);

    const startAutoScroll = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      scrollIntervalRef.current = setInterval(() => {
        if (isPaused) return;

        const container = scrollContainerRef.current;
        if (!container) return;

        // Get the first card element to calculate scroll amount dynamically
        const firstCard = container.querySelector("div > div");
        if (!firstCard) return;

        const cardWidth = firstCard.getBoundingClientRect().width;
        const gap = 16; // gap-4 = 16px
        const scrollAmount = cardWidth + gap;
        const originalWidth = originalScrollWidthRef.current || (cardWidth + gap) * featuredNumbers.length;

        // Check if we've scrolled past the original set
        if (container.scrollLeft >= originalWidth - 10) {
          // Instantly reset to beginning without smooth behavior for seamless loop
          container.scrollLeft = container.scrollLeft - originalWidth;
        } else {
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }, 3000); // Scroll every 3 seconds
    };

    startAutoScroll();

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [featuredNumbers, loading, isPaused]);

  const fetchFeaturedNumbers = async () => {
    try {
      const response = await fetch("/api/numbers?featuredNumber=true");
      if (!response.ok) {
        console.error("API response not OK:", response.status, response.statusText);
      }
      const data = await response.json();
      if (data.error) {
        console.error("Error fetching featured numbers:", data.error, data.details ? `Details: ${data.details}` : "");
        setFeaturedNumbers([]);
      } else {
        setFeaturedNumbers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching featured numbers:", error);
      setFeaturedNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Featured Numbers</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
        </div>
        <div className="text-white text-center">Loading featured numbers...</div>
      </div>
    );
  }

  if (featuredNumbers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Featured Numbers</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
        </div>
        <div className="text-white text-center">No featured numbers available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Featured Numbers</h2>
        <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
      </div>
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex gap-4 sm:gap-6 pb-4">
          {/* Render original set */}
          {featuredNumbers.map((item, index) => (
            <div
              key={`original-${item._id}-${index}`}
              className="bg-gradient-to-r from-[#FFB800] via-[#FFD700] to-[#FFB800] rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group relative h-[170px] sm:h-[190px] w-[280px] sm:w-[320px] md:w-[370px] flex-shrink-0 flex flex-col"
            >
              <div className="absolute top-4 left-4">
                <Image
                  src={getNetworkLogo(item.network)}
                  alt={item.network}
                  width={60}
                  height={30}
                  className="object-contain h-10 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              {item.limitedOffer && (
                <div className="absolute top-4 right-4">
                  <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Limited Offer
                  </span>
                </div>
              )}
              <div className="flex-1 flex items-center justify-center mt-8">
                <p className="text-3xl font-bold text-black text-center">
                  {item.number}
                </p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <button 
                  onClick={openWhatsApp}
                  className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors duration-300"
                >
                  Buy Now
                </button>
                {item.price !== "Price On Call" && (
                  <span className="text-lg font-semibold text-black">
                    {item.price}
                  </span>
                )}
                {item.price === "Price On Call" && (
                  <button 
                    onClick={openWhatsApp}
                    className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors duration-300 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
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
                )}
              </div>
            </div>
          ))}
          {/* Duplicate set for infinite scroll */}
          {featuredNumbers.map((item, index) => (
            <div
              key={`duplicate-${item._id}-${index}`}
              className="bg-gradient-to-r from-[#FFB800] via-[#FFD700] to-[#FFB800] rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group relative h-[170px] sm:h-[190px] w-[280px] sm:w-[320px] md:w-[370px] flex-shrink-0 flex flex-col"
            >
              <div className="absolute top-4 left-4">
                <Image
                  src={getNetworkLogo(item.network)}
                  alt={item.network}
                  width={60}
                  height={30}
                  className="object-contain h-10 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              {item.limitedOffer && (
                <div className="absolute top-4 right-4">
                  <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Limited Offer
                  </span>
                </div>
              )}
              <div className="flex-1 flex items-center justify-center mt-8">
                <p className="text-3xl font-bold text-black text-center">
                  {item.number}
                </p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <button 
                  onClick={openWhatsApp}
                  className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors duration-300"
                >
                  Buy Now
                </button>
                {item.price !== "Price On Call" && (
                  <span className="text-lg font-semibold text-black">
                    {item.price}
                  </span>
                )}
                {item.price === "Price On Call" && (
                  <button 
                    onClick={openWhatsApp}
                    className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors duration-300 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
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
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedNumbersCards;
