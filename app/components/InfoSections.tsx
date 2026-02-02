"use client";

import { useState, useRef, useEffect } from "react";
import { openWhatsApp } from "./utils";

const clients = [
  { id: 1, name: "THE RENOVATORS", isBold: true },
  { id: 2, name: "ANSS MARKETING", isBold: true },
  { id: 3, name: "CLIENT 3", isBold: false },
  { id: 4, name: "CLIENT 4", isBold: false },
  { id: 5, name: "CLIENT 5", isBold: false },
  { id: 6, name: "CLIENT 6", isBold: false },
  { id: 7, name: "CLIENT 7", isBold: false },
];

const InfoSections = () => {
  const [deliveryExpanded, setDeliveryExpanded] = useState(true);
  const [biometricExpanded, setBiometricExpanded] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Wait for content to render
    const startScrolling = () => {
      if (container.scrollWidth <= container.clientWidth) return;

      const scroll = () => {
        if (isPaused) return;

        const scrollAmount = 1;
        container.scrollLeft += scrollAmount;

        // Reset to beginning when we reach halfway (where duplicate starts)
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      };

      scrollIntervalRef.current = setInterval(scroll, 20);
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(startScrolling, 100);

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      clearTimeout(timeoutId);
    };
  }, [isPaused]);

  return (
    <div className="w-full py-8 px-4">
      <div className="container mx-auto space-y-4">
        {/* Delivery Section */}
        <div className="bg-gray-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="text-white font-bold text-xl md:text-2xl">
                Delivery
              </h3>
            </div>
            <button
              onClick={() => setDeliveryExpanded(!deliveryExpanded)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className={`w-5 h-5 transition-transform ${
                  deliveryExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
          {deliveryExpanded && (
            <div className="space-y-2 text-white">
              <div className="flex items-start gap-2">
                <span className="text-white mt-1">•</span>
                <span>Lahore: Instant delivery (2-4 Hours)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-white mt-1">•</span>
                <span>Karachi: 2 days</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-white mt-1">•</span>
                <span>Islamabad: 2 days</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-white mt-1">•</span>
                <span>Faisalabad: 2 days</span>
              </div>
            </div>
          )}
        </div>

        {/* Biometric Section */}
        <div className="bg-gray-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
              <h3 className="text-white font-bold text-xl md:text-2xl">
                Biometric
              </h3>
            </div>
            <button
              onClick={() => setBiometricExpanded(!biometricExpanded)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className={`w-5 h-5 transition-transform ${
                  biometricExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
          {biometricExpanded && (
            <p className="text-white leading-relaxed">
              Biometric transfer is the process of transferring mobile numbers
              using fingerprint verification, as per PTA regulations, ensuring
              secure transfers through CNIC and biometric data. This facility
              for premium mobile numbers is available in major cities, including
              Lahore, Islamabad, Karachi, and Faisalabad.
            </p>
          )}
        </div>

        {/* Our Clients Section */}
        <div className="mt-12 md:mt-20">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white uppercase mb-2">
                CLIENTS WE WORK WITH
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
            </div>
            <p className="text-white text-sm md:text-base max-w-md text-right">
              WE CAN&apos;T WAIT TO SHOW YOU WHAT WE CAN DO FOR YOU AND YOUR
              BRAND.
            </p>
          </div>
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-hidden scrollbar-hide w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{ scrollBehavior: "auto" }}
          >
            <div
              className="flex gap-6 md:gap-8"
              style={{ width: "max-content", display: "flex" }}
            >
              {/* Duplicate clients for infinite scroll */}
              {[...clients, ...clients].map((client, index) => (
                <div
                  key={`${client.id}-${index}`}
                  className="flex-shrink-0 flex items-center justify-center h-20 md:h-24 min-w-[120px] md:min-w-[150px]"
                >
                  <div
                    className={`text-white text-center ${
                      client.isBold
                        ? "font-bold text-lg md:text-xl"
                        : "font-semibold text-base md:text-lg"
                    }`}
                  >
                    {client.name.split(" ").map((word, i) => (
                      <div key={i}>{word}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Your SIM Banner */}
        <div className="mt-12 md:mt-20">
          <button 
            onClick={openWhatsApp}
            className="w-full bg-black border-2 border-[#FFD700] rounded-full px-6 py-4 flex items-center justify-center gap-4 hover:opacity-90 transition-opacity"
          >
            <div className="relative flex-shrink-0 flex items-center">
              {/* Gift Box Icon */}
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                {/* Gift Box Base (Deep Blue) */}
                <rect
                  x="10"
                  y="22"
                  width="28"
                  height="20"
                  rx="2"
                  fill="#1e40af"
                />
                {/* Gift Box Lid (Golden) - Open */}
                <path d="M10 22 L24 14 L38 22 L24 30 Z" fill="#FFD700" />
                {/* White Ribbon Vertical */}
                <rect x="22" y="14" width="4" height="28" fill="#ffffff" />
                {/* White Ribbon Horizontal */}
                <rect x="10" y="22" width="28" height="4" fill="#ffffff" />
                {/* Golden Sparkles */}
                <circle cx="30" cy="16" r="2" fill="#FFD700" />
                <circle cx="34" cy="19" r="1.5" fill="#FFD700" />
                <circle cx="32" cy="14" r="1.5" fill="#FFD700" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg md:text-xl uppercase tracking-wide flex items-center">
              UPGRADE YOUR SIM
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoSections;
