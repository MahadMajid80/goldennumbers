"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
    <div className="scrollbar-hide flex items-center gap-3 overflow-x-auto p-4 sm:gap-4 sm:p-5 sm:pr-6">
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

const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const PremiumNumbersTable = () => {
  const [premiumNumbers, setPremiumNumbers] = useState<PremiumNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRowRef = useRef<HTMLDivElement>(null);
  const hasPlayedScrollHintRef = useRef(false);

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

    const sectionEl = sectionRef.current;
    const rowEl = scrollRowRef.current;
    if (!sectionEl || !rowEl) return;

    let aborted = false;
    let timeoutId: number | undefined;
    let rafId: number | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasPlayedScrollHintRef.current) return;

        const playHint = () => {
          if (aborted) return;
          const maxScrollLeft = rowEl.scrollWidth - rowEl.clientWidth;
          if (maxScrollLeft <= 0) {
            hasPlayedScrollHintRef.current = true;
            return;
          }

          hasPlayedScrollHintRef.current = true;
          const start = rowEl.scrollLeft;
          const durationMs = 2800;

          const animateScroll = (
            from: number,
            to: number,
            onDone: () => void,
          ) => {
            const animStart = performance.now();
            const delta = to - from;
            const step = (now: number) => {
              if (aborted) return;
              const elapsed = now - animStart;
              const progress = Math.min(elapsed / durationMs, 1);
              rowEl.scrollLeft = from + delta * easeInOutQuad(progress);
              if (progress < 1) {
                rafId = window.requestAnimationFrame(step);
              } else {
                onDone();
              }
            };
            rafId = window.requestAnimationFrame(step);
          };

          timeoutId = window.setTimeout(() => {
            if (aborted) return;
            animateScroll(start, maxScrollLeft, () => {
              if (aborted) return;
              animateScroll(maxScrollLeft, start, () => {});
            });
          }, 400);
        };

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(playHint);
        });

        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(sectionEl);

    return () => {
      aborted = true;
      observer.disconnect();
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
    };
  }, [loading, displayNumbers.length]);

  const showingLocalPreview =
    isDevelopment &&
    premiumNumbers.length === 0 &&
    displayNumbers.length > 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-block">
            <h2 className="text-2xl font-bold text-white mb-2">
              Premium Numbers Available
            </h2>
            <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
          </div>
        </div>
        <div className="text-white text-center">Loading premium numbers...</div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-block">
          <h2 className="text-2xl font-bold text-white mb-2">
            Premium Numbers Available
          </h2>
          <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
        </div>
      </div>

      {showingLocalPreview && (
        <p className="mb-4 text-center text-xs text-gray-500">
          Local preview — mock tiles; real data appears when premium numbers exist in the
          database.
        </p>
      )}

      {displayNumbers.length === 0 ? (
        <div className="text-white text-center py-12">
          No premium numbers available
        </div>
      ) : (
        <div
          ref={scrollRowRef}
          className="scrollbar-hide flex gap-5 overflow-x-auto pb-2 pt-1 [-webkit-overflow-scrolling:touch]"
        >
          {displayNumbers.map((num, index) => (
            <div
              key={num._id}
              className="w-[min(92vw,28rem)] shrink-0 sm:w-[26rem] md:w-[28rem]"
            >
              <PremiumNumberCard num={num} index={index} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PremiumNumbersTable;
