"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { openWhatsApp, openDialer } from "./utils";
import { playHorizontalScrollHint } from "../../helpers/playHorizontalScrollHint";

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
    <div
      data-premium-card-inner-scroll
      className="scrollbar-hide flex min-w-0 items-center gap-3 overflow-x-auto p-4 [-webkit-overflow-scrolling:touch] sm:gap-4 sm:p-5 sm:pr-6"
    >
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

      <p className="shrink-0 text-lg font-bold tracking-tight text-[#e6c84a] sm:text-xl md:text-2xl">
        {num.number}
      </p>

      {num.categoryId && num.categoryId.length > 0 && (
        <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
          {num.categoryId.map((cat) => (
            <span
              key={cat._id}
              className="inline-flex shrink-0 rounded-md border border-[#FFD700]/25 bg-[#FFD700]/10 px-2 py-0.5 text-[10px] font-semibold leading-snug text-[#e8cf6a] sm:text-[11px]"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        {num.price === "Price On Call" ? (
          <button
            type="button"
            onClick={() => openDialer()}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-600 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#FFD700]/40 hover:bg-zinc-900 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
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
          <>
            <button
              type="button"
              onClick={openWhatsApp}
              className="rounded-full bg-[#c9a227] px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#d4af37] sm:px-4 sm:py-2 sm:text-sm"
            >
              Buy Now
            </button>
            <span className="text-sm font-medium text-gray-400 sm:text-base">
              {num.price}
            </span>
          </>
        )}
      </div>
    </div>
  </div>
);

const PremiumNumbersTable = () => {
  const [premiumNumbers, setPremiumNumbers] = useState<PremiumNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const premiumNumbersBlockRef = useRef<HTMLDivElement>(null);
  const hasPlayedPremiumInnerHintRef = useRef(false);
  const premiumInnerHintHandlesRef = useRef<Array<{ cancel: () => void }>>(
    [],
  );

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

  useEffect(() => {
    if (loading || displayNumbers.length === 0) return;

    const blockEl = premiumNumbersBlockRef.current;
    if (!blockEl) return;

    let teardown = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasPlayedPremiumInnerHintRef.current) {
          return;
        }

        const playHints = (): void => {
          if (teardown) return;
          hasPlayedPremiumInnerHintRef.current = true;
          premiumInnerHintHandlesRef.current.forEach((h) => h.cancel());
          premiumInnerHintHandlesRef.current = [];

          const nodes = blockEl.querySelectorAll<HTMLElement>(
            "[data-premium-card-inner-scroll]",
          );

          nodes.forEach((node, index) => {
            const maxScroll = node.scrollWidth - node.clientWidth;
            if (maxScroll <= 0) return;

            const handle = playHorizontalScrollHint(node, {
              delayMs: 400 + index * 45,
              durationMs: 2400,
            });
            premiumInnerHintHandlesRef.current.push(handle);
          });
        };

        requestAnimationFrame(() => {
          requestAnimationFrame(playHints);
        });

        observer.disconnect();
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(blockEl);

    return () => {
      teardown = true;
      observer.disconnect();
      premiumInnerHintHandlesRef.current.forEach((h) => h.cancel());
      premiumInnerHintHandlesRef.current = [];
    };
  }, [loading, displayNumbers.length]);

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
          <div ref={premiumNumbersBlockRef}>
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
