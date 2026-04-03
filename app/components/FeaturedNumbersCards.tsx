"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { openWhatsApp, openDialer } from "./utils";

type NumberCard = {
  _id: string;
  number: string;
  price: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  limitedOffer?: boolean;
  categoryId?: Array<{ _id: string; name: string }>;
};

type FeaturedYellowCategoriesProps = {
  categories: Array<{ _id: string; name: string }>;
  variant: "mobile" | "desktop";
};

const FeaturedYellowCardCategories = ({
  categories,
  variant,
}: FeaturedYellowCategoriesProps) => {
  if (!categories.length) return null;
  const chipClass =
    variant === "mobile"
      ? "rounded-full border border-black/40 bg-black/[0.12] px-2 py-0.5 text-[11px] font-semibold leading-tight text-black"
      : "rounded-full border border-black/40 bg-black/[0.12] px-2.5 py-0.5 text-xs font-semibold leading-tight text-black";
  return (
    <div
      className="flex max-w-full flex-wrap justify-center gap-1.5 px-1"
      aria-label="Categories"
    >
      {categories.map((cat) => (
        <span key={cat._id} className={chipClass}>
          {cat.name}
        </span>
      ))}
    </div>
  );
};

/** Gold pill for price / Price On Call — same shape as Buy Now, gold fill for contrast on the card. */
const featuredPricePillBase =
  "inline-flex items-center justify-center rounded-full border border-black/25 bg-gradient-to-b from-[#FFEB99] via-[#FFD700] to-[#E6AC00] font-bold text-black shadow-md ring-1 ring-black/10";

const featuredPricePillMobile = `${featuredPricePillBase} px-3 py-1.5 text-base`;

const featuredPricePillMobilePoc = `${featuredPricePillBase} gap-1.5 px-3 py-1.5 text-xs`;

const featuredPricePillDesktop = `${featuredPricePillBase} px-4 py-2 text-lg`;

const featuredPricePillDesktopPoc = `${featuredPricePillBase} gap-2 px-4 py-2 text-sm`;

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

const MOBILE_MAX_WIDTH_PX = 767;

const isMobileViewport = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches;

const FeaturedNumbersCards = () => {
  const [featuredNumbers, setFeaturedNumbers] = useState<NumberCard[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const mobileScrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
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

  useEffect(() => {
    if (featuredNumbers.length === 0 || loading) return;

    const MOBILE_INTERVAL_MS = 3500;
    const clearMobileInterval = () => {
      if (mobileScrollIntervalRef.current) {
        clearInterval(mobileScrollIntervalRef.current);
        mobileScrollIntervalRef.current = null;
      }
    };

    const tickMobile = () => {
      if (isPaused || !isMobileViewport()) return;
      const el = mobileCarouselRef.current;
      if (!el) return;

      const firstCard = el.querySelector<HTMLElement>(
        "[data-featured-carousel-card]",
      );
      if (!firstCard) return;

      const cardHeight = firstCard.getBoundingClientRect().height;
      const gap = 12;
      const step = cardHeight + gap;
      const maxScroll = el.scrollHeight - el.clientHeight;

      if (maxScroll <= 4) return;

      const nextTop = el.scrollTop + step;
      if (nextTop >= maxScroll - 2) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ top: nextTop, behavior: "smooth" });
      }
    };

    const startMobileAutoScroll = () => {
      clearMobileInterval();
      mobileScrollIntervalRef.current = setInterval(
        tickMobile,
        MOBILE_INTERVAL_MS,
      );
    };

    startMobileAutoScroll();

    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`);
    const onViewportChange = () => {
      if (isMobileViewport()) {
        startMobileAutoScroll();
      } else {
        clearMobileInterval();
      }
    };
    mq.addEventListener("change", onViewportChange);

    return () => {
      clearMobileInterval();
      mq.removeEventListener("change", onViewportChange);
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

  const sectionFrameClass =
    "rounded-xl border border-[#FFD700]/45 bg-zinc-950/25 p-4 shadow-[inset_0_1px_0_0_rgba(255,215,0,0.06)] md:p-6";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={sectionFrameClass}>
          <div className="mb-6 text-center">
            <div className="inline-block">
              <h2 className="text-2xl font-bold text-white mb-2">
                Featured Numbers
              </h2>
              <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
            </div>
          </div>
          <div className="text-center text-white">
            Loading featured numbers...
          </div>
        </div>
      </div>
    );
  }

  if (featuredNumbers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={sectionFrameClass}>
          <div className="mb-6 text-center">
            <div className="inline-block">
              <h2 className="text-2xl font-bold text-white mb-2">
                Featured Numbers
              </h2>
              <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
            </div>
          </div>
          <div className="text-center text-white">
            No featured numbers available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={sectionFrameClass}>
      <div className="mb-6 text-center">
        <div className="inline-block">
          <h2 className="text-2xl font-bold text-white mb-2">Featured Numbers</h2>
          <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded"></div>
        </div>
      </div>
      {/* Mobile: single-card vertical carousel with snap scrolling */}
      <div className="md:hidden">
        <div
          ref={mobileCarouselRef}
          className="h-[248px] overflow-y-auto scrollbar-hide snap-y snap-mandatory space-y-3 pb-2 [-webkit-overflow-scrolling:touch]"
          onPointerEnter={() => setIsPaused(true)}
          onPointerLeave={() => setIsPaused(false)}
        >
          {featuredNumbers.map((item) => (
            <div
              key={item._id}
              data-featured-carousel-card
              className="snap-center flex min-h-[200px] flex-col rounded-2xl bg-gradient-to-r from-[#FFB800] via-[#FFD700] to-[#FFD100] px-4 py-3 shadow-lg"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <Image
                  src={getNetworkLogo(item.network)}
                  alt={item.network}
                  width={50}
                  height={24}
                  className="h-8 shrink-0 object-contain"
                />
                <div className="flex min-w-0 flex-col items-end gap-1.5 text-right">
                  {item.limitedOffer && (
                    <span className="whitespace-nowrap rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                      Limited Offer
                    </span>
                  )}
                  {item.price !== "Price On Call" && (
                    <span className={featuredPricePillMobile}>{item.price}</span>
                  )}
                  {item.price === "Price On Call" && (
                    <button
                      type="button"
                      onClick={() => openDialer()}
                      className={`${featuredPricePillMobilePoc} transition-[filter] duration-300 hover:brightness-105`}
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0"
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
              <div className="mb-2 flex flex-1 flex-col items-center justify-center gap-2">
                <p className="text-center text-2xl font-bold text-black">
                  {item.number}
                </p>
                <FeaturedYellowCardCategories
                  categories={item.categoryId ?? []}
                  variant="mobile"
                />
              </div>
              <div className="mt-auto flex justify-start">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-gray-800"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop / tablet: existing horizontal auto-scrolling carousel */}
      <div
        ref={scrollContainerRef}
        className="hidden md:block overflow-x-auto scrollbar-hide"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex gap-4 sm:gap-6 pb-4">
          {/* Render original set */}
          {featuredNumbers.map((item, index) => (
            <div
              key={`original-${item._id}-${index}`}
              className="group relative flex h-[200px] w-[280px] flex-shrink-0 cursor-pointer flex-col rounded-2xl bg-gradient-to-r from-[#FFB800] via-[#FFD700] to-[#FFB800] p-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:h-[218px] sm:w-[320px] sm:p-6 md:h-[224px] md:w-[370px]"
            >
              <div className="absolute left-4 top-4 z-10">
                <Image
                  src={getNetworkLogo(item.network)}
                  alt={item.network}
                  width={60}
                  height={30}
                  className="h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="absolute right-4 top-4 z-10 flex max-w-[58%] flex-col items-end gap-2 text-right">
                {item.limitedOffer && (
                  <span className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                    Limited Offer
                  </span>
                )}
                {item.price !== "Price On Call" && (
                  <span className={featuredPricePillDesktop}>{item.price}</span>
                )}
                {item.price === "Price On Call" && (
                  <button
                    type="button"
                    onClick={() => openDialer()}
                    className={`${featuredPricePillDesktopPoc} transition-[filter] duration-300 hover:brightness-105`}
                  >
                    <svg
                      className="h-4 w-4 shrink-0"
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
              <div className="mt-8 flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 px-2">
                <p className="text-center text-3xl font-bold text-black">
                  {item.number}
                </p>
                <FeaturedYellowCardCategories
                  categories={item.categoryId ?? []}
                  variant="desktop"
                />
              </div>
              <div className="relative z-10 mt-auto flex justify-start pt-2">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-gray-800"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
          {/* Duplicate set for infinite scroll */}
          {featuredNumbers.map((item, index) => (
            <div
              key={`duplicate-${item._id}-${index}`}
              className="group relative flex h-[200px] w-[280px] flex-shrink-0 cursor-pointer flex-col rounded-2xl bg-gradient-to-r from-[#FFB800] via-[#FFD700] to-[#FFB800] p-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:h-[218px] sm:w-[320px] sm:p-6 md:h-[224px] md:w-[370px]"
            >
              <div className="absolute left-4 top-4 z-10">
                <Image
                  src={getNetworkLogo(item.network)}
                  alt={item.network}
                  width={60}
                  height={30}
                  className="h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="absolute right-4 top-4 z-10 flex max-w-[58%] flex-col items-end gap-2 text-right">
                {item.limitedOffer && (
                  <span className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                    Limited Offer
                  </span>
                )}
                {item.price !== "Price On Call" && (
                  <span className={featuredPricePillDesktop}>{item.price}</span>
                )}
                {item.price === "Price On Call" && (
                  <button
                    type="button"
                    onClick={() => openDialer()}
                    className={`${featuredPricePillDesktopPoc} transition-[filter] duration-300 hover:brightness-105`}
                  >
                    <svg
                      className="h-4 w-4 shrink-0"
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
              <div className="mt-8 flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 px-2">
                <p className="text-center text-3xl font-bold text-black">
                  {item.number}
                </p>
                <FeaturedYellowCardCategories
                  categories={item.categoryId ?? []}
                  variant="desktop"
                />
              </div>
              <div className="relative z-10 mt-auto flex justify-start pt-2">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-gray-800"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default FeaturedNumbersCards;
