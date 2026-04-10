"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { openWhatsApp, openDialer } from "./utils";

type PremiumNumber = {
  _id: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  number: string;
  price: string;
  categoryId: Array<{ _id: string; name: string }>;
};

/** Shown on localhost when the API returns no premium numbers (design preview only). */
const MOCK_PREMIUM_FOR_LOCAL_PREVIEW: PremiumNumber[] = [
  {
    _id: "local-preview-mock-1",
    network: "Jazz",
    number: "0303 0000 888",
    price: "Price On Call",
    categoryId: [
      { _id: "mock-cat-1", name: "Tetra-Triple" },
      { _id: "mock-cat-2", name: "Tetra" },
      { _id: "mock-cat-3", name: "Repeating" },
    ],
  },
  {
    _id: "local-preview-mock-2",
    network: "Zong",
    number: "0321 765 4321",
    price: "Rs 1,500,000",
    categoryId: [{ _id: "mock-cat-4", name: "Platinum Numbers" }],
  },
];

const isDevelopment = process.env.NODE_ENV === "development";

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
 
type PremiumNumberCardProps = {
  num: PremiumNumber;
  index: number;
};

const PremiumNumberCard = ({ num, index }: PremiumNumberCardProps) => (
  <div
    className="group relative overflow-hidden rounded-2xl border border-gray-700/60 bg-gradient-to-br from-[#0f1419] via-[#151b24] to-[#0c1016] shadow-lg transition-all duration-300 hover:border-[#FFD700]/35 hover:shadow-[0_12px_40px_-12px_rgba(255,215,0,0.18)]"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <div
      className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-[#FFD700] via-[#d4af37] to-[#8a7020] opacity-90"
      aria-hidden
    />
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-gray-700/50 bg-black/35 sm:h-14 sm:w-14">
          <Image
            src={getNetworkLogo(num.network)}
            alt={num.network}
            width={72}
            height={36}
            className="h-7 w-auto max-w-[2.75rem] object-contain transition-transform duration-300 group-hover:scale-105 sm:h-8 sm:max-w-[3.25rem]"
          />
          {num.network === "Ufone" && (
            <span className="mt-0.5 max-w-[3rem] truncate text-[8px] uppercase leading-none text-gray-500">
              all about u
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-lg font-bold tracking-tight text-[#e6c84a] sm:text-xl md:text-2xl break-words">
            {num.number}
          </p>
          {num.categoryId && num.categoryId.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {num.categoryId.map((cat) => (
                <span
                  key={cat._id}
                  className="inline-flex max-w-full rounded-md border border-[#FFD700]/25 bg-[#FFD700]/10 px-2 py-0.5 text-[10px] font-semibold leading-snug text-[#e8cf6a] sm:text-[11px]"
                >
                  <span className="break-words text-left">{cat.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-gray-700/50 pt-3 sm:gap-3 sm:pl-[calc(3.5rem+1rem)] sm:pt-3">
        {num.price === "Price On Call" ? (
          <button
            type="button"
            onClick={() => openDialer()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-zinc-600 bg-zinc-950 px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-[#FFD700]/40 hover:bg-zinc-900 sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
          >
            <svg
              className="h-3.5 w-3.5 shrink-0 opacity-90 sm:h-4 sm:w-4"
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
            Price On Call
          </button>
        ) : (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={openWhatsApp}
              className="w-full rounded-full bg-[#c9a227] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#d4af37] sm:w-auto"
            >
              Buy Now
            </button>
            <span className="text-center text-sm font-medium text-gray-400 sm:text-left sm:text-base">
              {num.price}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const PremiumNumbersTable = () => {
  const [premiumNumbers, setPremiumNumbers] = useState<PremiumNumber[]>([]);
  const [loading, setLoading] = useState(true);

  const displayNumbers = useMemo(
    () =>
      premiumNumbers.length > 0
        ? premiumNumbers
        : isDevelopment
          ? MOCK_PREMIUM_FOR_LOCAL_PREVIEW
          : [],
    [premiumNumbers],
  );

  const fetchPremiumNumbers = async () => {
    try {
      const response = await fetch("/api/numbers?premiumNumber=true");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        console.error("Error fetching premium numbers:", errorData.error, errorData.details ? `Details: ${errorData.details}` : "");
        setPremiumNumbers([]);
        return;
      }

      const data = await response.json();
      if (data.error) {
        console.error("Error fetching premium numbers:", data.error, data.details ? `Details: ${data.details}` : "");
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

  useEffect(() => {
    fetchPremiumNumbers();
  }, []);

  const showingLocalPreview =
    isDevelopment &&
    premiumNumbers.length === 0 &&
    displayNumbers.length > 0;

  const premiumSectionFrameClass =
    "rounded-xl border border-[#FFD700]/45 bg-zinc-950/25 p-4 shadow-[inset_0_1px_0_0_rgba(255,215,0,0.06)] md:p-6";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={premiumSectionFrameClass}>
          <div className="mb-8 text-center">
            <div className="inline-block">
              <h2 className="mb-2 text-2xl font-bold text-white">
                Premium Numbers Available
              </h2>
              <div className="h-1 rounded bg-gradient-to-r from-[#FFD700] to-[#FFA500]"></div>
            </div>
          </div>
          <div className="text-center text-white">
            Loading premium numbers...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={premiumSectionFrameClass}>
        <div className="mb-8 text-center">
          <div className="inline-block">
            <h2 className="mb-2 text-2xl font-bold text-white">
              Premium Numbers Available
            </h2>
            <div className="h-1 rounded bg-gradient-to-r from-[#FFD700] to-[#FFA500]"></div>
          </div>
        </div>

        {showingLocalPreview && (
          <p className="mb-4 text-center text-xs text-gray-500">
            Local preview — mock tiles; real data appears when premium numbers exist in
            the database.
          </p>
        )}

        {displayNumbers.length === 0 ? (
          <div className="py-12 text-center text-white">
            No premium numbers available
          </div>
        ) : (
          <div>
            {displayNumbers.length > 8 ? (
              <div
                className="max-h-[500px] overflow-y-auto overflow-x-hidden pr-2 md:max-h-[450px]"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#4B5563 #1F2937",
                }}
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                  {displayNumbers.map((num, index) => (
                    <PremiumNumberCard key={num._id} num={num} index={index} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                {displayNumbers.map((num, index) => (
                  <PremiumNumberCard key={num._id} num={num} index={index} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumNumbersTable;
