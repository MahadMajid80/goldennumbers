"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import CallPreviewModal from "./CallPreviewModal";
import DeviceSelector, { DeviceType } from "./DeviceSelector";
import { openWhatsApp, openDialer } from "./utils";
import { playHorizontalScrollHint } from "../../helpers/playHorizontalScrollHint";

type Category = {
  _id: string;
  name: string;
  slug: string;
};

type NumberItem = {
  _id: string;
  number: string;
  price: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  categoryId: Array<{ _id: string; name: string }>;
};

type FeaturedNumbersListProps = {
  searchTerm: string;
  selectedNetwork: string | null;
  setSelectedNetwork: (network: string | null) => void;
  minPrice: string;
  maxPrice: string;
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

const FeaturedNumbersList = ({
  searchTerm,
  selectedNetwork,
  setSelectedNetwork,
  minPrice,
  maxPrice,
}: FeaturedNumbersListProps) => {
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [previewNumber, setPreviewNumber] = useState<NumberItem | null>(null);
  const [selectedDevice, setSelectedDevice] =
    useState<DeviceType>("iphone-14-pro-max");
  const categorySliderRef = useRef<HTMLDivElement>(null);
  const hasAutoSlidCategoryRef = useRef(false);
  const featuredNumbersBlockRef = useRef<HTMLDivElement>(null);
  const hasPlayedFeaturedTagsHintRef = useRef(false);
  const featuredTagHintHandlesRef = useRef<Array<{ cancel: () => void }>>(
    [],
  );

  useEffect(() => {
    fetchNumbers();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (hasAutoSlidCategoryRef.current) return;
    if (typeof window === "undefined" || window.innerWidth >= 768) return;

    const slider = categorySliderRef.current;
    if (!slider) return;

    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    if (maxScrollLeft <= 0) return;

    let rafId = 0;
    let aborted = false;

    const easeInOut = (t: number): number =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const animateScroll = (
      from: number,
      to: number,
      durationMs: number,
      onComplete: () => void,
    ) => {
      const animationStart = performance.now();
      const distance = to - from;

      const step = (now: number) => {
        if (aborted) return;
        const elapsed = now - animationStart;
        const progress = Math.min(elapsed / durationMs, 1);
        const easedProgress = easeInOut(progress);
        slider.scrollLeft = from + distance * easedProgress;

        if (progress < 1) {
          rafId = window.requestAnimationFrame(step);
        } else {
          onComplete();
        }
      };

      rafId = window.requestAnimationFrame(step);
    };

    const durationMs = 2800;
    const timer = window.setTimeout(() => {
      const start = slider.scrollLeft;
      animateScroll(start, maxScrollLeft, durationMs, () => {
        if (aborted) return;
        animateScroll(maxScrollLeft, start, durationMs, () => {
          if (!aborted) {
            hasAutoSlidCategoryRef.current = true;
          }
        });
      });
    }, 500);

    return () => {
      aborted = true;
      window.clearTimeout(timer);
      window.cancelAnimationFrame(rafId);
    };
  }, [categories.length]);

  const fetchNumbers = async () => {
    try {
      const response = await fetch("/api/numbers");
      if (!response.ok) {
        console.error(
          "API response not OK:",
          response.status,
          response.statusText,
        );
      }
      const data = await response.json();
      if (data.error) {
        console.error(
          "Error fetching numbers:",
          data.error,
          data.details ? `Details: ${data.details}` : "",
        );
        setNumbers([]);
      } else {
        setNumbers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching numbers:", error);
      setNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        console.error(
          "API response not OK:",
          response.status,
          response.statusText,
        );
      }
      const data = await response.json();
      if (data.error) {
        console.error(
          "Error fetching categories:",
          data.error,
          data.details ? `Details: ${data.details}` : "",
        );
        setCategories([]);
      } else {
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const filters = ["All", ...categories.map((cat) => cat.name)];

  let filteredNumbers = numbers;

  if (searchTerm.trim()) {
    filteredNumbers = filteredNumbers.filter((num) =>
      num.number.toLowerCase().includes(searchTerm.toLowerCase().trim()),
    );
  }

  if (selectedNetwork) {
    filteredNumbers = filteredNumbers.filter(
      (num) => num.network === selectedNetwork,
    );
  }

  if (activeFilter !== "All") {
    filteredNumbers = filteredNumbers.filter((num) =>
      num.categoryId.some((cat) => cat.name === activeFilter),
    );
  }

  if (minPrice || maxPrice) {
    filteredNumbers = filteredNumbers.filter((num) => {
      const priceStr = num.price.replace(/[^0-9]/g, "");
      const price = parseInt(priceStr);
      if (isNaN(price)) return true;

      if (minPrice && price < parseInt(minPrice)) return false;
      if (maxPrice && price > parseInt(maxPrice)) return false;
      return true;
    });
  }

  useEffect(() => {
    if (loading || filteredNumbers.length === 0) return;

    const blockEl = featuredNumbersBlockRef.current;
    if (!blockEl) return;

    let teardown = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasPlayedFeaturedTagsHintRef.current) {
          return;
        }

        const playHints = (): void => {
          if (teardown) return;
          hasPlayedFeaturedTagsHintRef.current = true;
          featuredTagHintHandlesRef.current.forEach((h) => h.cancel());
          featuredTagHintHandlesRef.current = [];

          const nodes = blockEl.querySelectorAll<HTMLElement>(
            "[data-featured-card-tags-scroll]",
          );

          nodes.forEach((node, index) => {
            const maxScroll = node.scrollWidth - node.clientWidth;
            if (maxScroll <= 0) return;

            const handle = playHorizontalScrollHint(node, {
              delayMs: 400 + index * 45,
              durationMs: 2400,
            });
            featuredTagHintHandlesRef.current.push(handle);
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
      featuredTagHintHandlesRef.current.forEach((h) => h.cancel());
      featuredTagHintHandlesRef.current = [];
    };
  }, [loading, filteredNumbers.length]);

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        <div className="rounded-xl border border-[#FFD700]/45 bg-zinc-950/25 p-4 shadow-[inset_0_1px_0_0_rgba(255,215,0,0.06)] md:p-6">
        <div className="hidden md:flex flex-wrap items-center justify-center gap-4 mb-6 border-2 border-[#FFD700] rounded-lg p-4">
          <div className="transition-all duration-300">
            <Image
              src="/jazz-logo.png"
              alt="Jazz"
              width={200}
              height={100}
              className="object-contain h-24 hover:scale-110 hover:rotate-3 transition-all duration-300"
            />
          </div>
          <div className="transition-all duration-300">
            <Image
              src="/ufone-logo (1).png"
              alt="Ufone"
              width={240}
              height={120}
              className="object-contain h-32 hover:scale-110 hover:rotate-3 transition-all duration-300"
            />
          </div>
          <div className="transition-all duration-300">
            <Image
              src="/telenor-logo-icon (3).png"
              alt="Telenor"
              width={280}
              height={140}
              className="object-contain h-36 hover:scale-110 hover:rotate-3 transition-all duration-300"
            />
          </div>
          <div className="transition-all duration-300">
            <Image
              src="/zong-logo (1).png"
              alt="Zong 4G"
              width={240}
              height={120}
              className="object-contain h-32 hover:scale-110 hover:rotate-3 transition-all duration-300"
            />
          </div>
        </div>
        <div className="flex md:hidden items-center justify-center gap-2 mb-4 overflow-x-auto scrollbar-hide border border-gray-700/60 rounded-lg px-3 py-2">
          <button
            onClick={() => {
              if (selectedNetwork === "Jazz") {
                setSelectedNetwork(null);
              } else {
                setSelectedNetwork("Jazz");
              }
            }}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedNetwork === "Jazz"
                ? "border-2 border-[#FFD700] text-white"
                : "text-white"
            }`}
          >
            <span>Jazz</span>
            {selectedNetwork === "Jazz" && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              if (selectedNetwork === "Zong") {
                setSelectedNetwork(null);
              } else {
                setSelectedNetwork("Zong");
              }
            }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedNetwork === "Zong"
                ? "border-2 border-[#FFD700] text-white"
                : "text-white"
            }`}
          >
            Zong
          </button>
          <button
            onClick={() => {
              if (selectedNetwork === "Ufone") {
                setSelectedNetwork(null);
              } else {
                setSelectedNetwork("Ufone");
              }
            }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedNetwork === "Ufone"
                ? "border-2 border-[#FFD700] text-white"
                : "text-white"
            }`}
          >
            Ufone
          </button>
          <button
            onClick={() => {
              if (selectedNetwork === "Telenor") {
                setSelectedNetwork(null);
              } else {
                setSelectedNetwork("Telenor");
              }
            }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedNetwork === "Telenor"
                ? "border-2 border-[#FFD700] text-white"
                : "text-white"
            }`}
          >
            Telenor
          </button>
        </div>
        <div className="mb-6 md:mb-6 border border-gray-700/60 rounded-lg px-3 py-2 md:border-0 md:rounded-none md:px-0 md:py-0">
          <div ref={categorySliderRef} className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max pb-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 py-1.5 text-xs md:px-4 md:py-2 md:text-base rounded-full font-semibold transition-colors shadow-sm whitespace-nowrap flex-shrink-0 ${
                    activeFilter === filter
                      ? "bg-[#FFD700] text-black"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white text-lg">Loading numbers...</div>
          </div>
        ) : filteredNumbers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white text-lg">No numbers found</div>
          </div>
        ) : (
          <div ref={featuredNumbersBlockRef}>
            {filteredNumbers.length > 8 ? (
              <div
                className="max-h-[368px] md:max-h-[450px] overflow-y-auto overflow-x-hidden pr-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#4B5563 #1F2937",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
                  {filteredNumbers.map((item) => (
                    <div
                      key={item._id}
                      className="bg-gray-800 rounded-lg px-3 py-3 md:px-5 md:py-5 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 hover:bg-gray-750 transition-all duration-300"
                    >
                      {/* Mobile Layout */}
                      <div className="w-full md:hidden flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-11 h-11 rounded-full border-2 border-[#FFD700] flex items-center justify-center overflow-hidden bg-gray-800">
                            <Image
                              src={getNetworkLogo(item.network)}
                              alt={item.network}
                              width={44}
                              height={44}
                              className="object-contain w-full h-full p-1"
                            />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 flex-1 text-[1.05rem] font-bold text-white leading-tight whitespace-nowrap">
                              {item.number}
                            </p>
                            <p className="flex-shrink-0 text-base font-bold text-white leading-tight whitespace-nowrap">
                              {item.price}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            {item.categoryId && item.categoryId.length > 0 ? (
                              <div
                                data-featured-card-tags-scroll
                                className="scrollbar-hide flex min-w-0 max-w-full flex-1 items-center gap-1 overflow-x-auto [-webkit-overflow-scrolling:touch]"
                              >
                                {item.categoryId.map((cat) => (
                                  <span
                                    key={cat._id}
                                    className="bg-[#FFD700] text-black px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
                                  >
                                    {cat.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="flex-1" />
                            )}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={openWhatsApp}
                                className="bg-green-500 w-9 h-9 rounded-md flex items-center justify-center hover:bg-green-600 active:bg-green-600 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openDialer()}
                                className="bg-yellow-400 w-9 h-9 rounded-md flex items-center justify-center hover:bg-yellow-500 active:bg-yellow-500 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4 text-black"
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
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Desktop Layout */}
                      <div className="hidden md:flex items-center gap-4 flex-1 w-full">
                        <div className="flex-shrink-0">
                          <Image
                            src={getNetworkLogo(item.network)}
                            alt={item.network}
                            width={60}
                            height={30}
                            className="object-contain h-10"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xl font-bold text-white mb-2">
                            {item.number}
                          </p>
                          <span className="text-base font-semibold text-white">
                            {item.price}
                          </span>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                        <DeviceSelector
                          onSelectDevice={(device) => {
                            setSelectedDevice(device);
                            setPreviewNumber(item);
                          }}
                        />
                        <button
                          onClick={openWhatsApp}
                          className="bg-green-500 p-2 rounded-full hover:bg-green-600 transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDialer()}
                          className="bg-yellow-400 p-2 rounded-full hover:bg-yellow-500 transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-black"
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
                        </button>
                        <button
                          onClick={() => {
                            const shareData = {
                              title: `Golden Number: ${item.number}`,
                              text: `Check out this golden number: ${item.number} - ${item.price}`,
                              url: window.location.href,
                            };
                            if (navigator.share) {
                              navigator.share(shareData).catch((err) => {
                                console.log("Error sharing:", err);
                              });
                            } else {
                              navigator.clipboard.writeText(
                                `${shareData.text} - ${shareData.url}`,
                              );
                              alert("Link copied to clipboard!");
                            }
                          }}
                          className="bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition-colors"
                          title="Share"
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
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className={`${
                  filteredNumbers.length > 4
                    ? "max-h-[392px] overflow-y-auto overflow-x-hidden pr-2 md:max-h-none md:overflow-visible md:pr-0"
                    : ""
                }`}
                style={{
                  scrollbarWidth: filteredNumbers.length > 4 ? "thin" : undefined,
                  scrollbarColor:
                    filteredNumbers.length > 4 ? "#4B5563 #1F2937" : undefined,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
                  {filteredNumbers.map((item) => (
                  <div
                    key={item._id}
                    className="bg-gray-800 rounded-lg px-3 py-3 md:px-5 md:py-5 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 hover:bg-gray-750 transition-all duration-300"
                  >
                    {/* Mobile Layout */}
                    <div className="w-full md:hidden flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-11 h-11 rounded-full border-2 border-[#FFD700] flex items-center justify-center overflow-hidden bg-gray-800">
                          <Image
                            src={getNetworkLogo(item.network)}
                            alt={item.network}
                            width={44}
                            height={44}
                            className="object-contain w-full h-full p-1"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 flex-1 text-[1.05rem] font-bold text-white leading-tight whitespace-nowrap">
                            {item.number}
                          </p>
                          <p className="flex-shrink-0 text-base font-bold text-white leading-tight whitespace-nowrap">
                            {item.price}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          {item.categoryId && item.categoryId.length > 0 ? (
                            <div
                              data-featured-card-tags-scroll
                              className="scrollbar-hide flex min-w-0 max-w-full flex-1 items-center gap-1 overflow-x-auto [-webkit-overflow-scrolling:touch]"
                            >
                              {item.categoryId.map((cat) => (
                                <span
                                  key={cat._id}
                                  className="bg-[#FFD700] text-black px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
                                >
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="flex-1" />
                          )}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={openWhatsApp}
                              className="bg-green-500 w-9 h-9 rounded-md flex items-center justify-center hover:bg-green-600 active:bg-green-600 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDialer()}
                              className="bg-yellow-400 w-9 h-9 rounded-md flex items-center justify-center hover:bg-yellow-500 active:bg-yellow-500 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 text-black"
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
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center gap-4 flex-1 w-full">
                      <div className="flex-shrink-0">
                        <Image
                          src={getNetworkLogo(item.network)}
                          alt={item.network}
                          width={60}
                          height={30}
                          className="object-contain h-10"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xl font-bold text-white mb-2">
                          {item.number}
                        </p>
                        <span className="text-base font-semibold text-white">
                          {item.price}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                      <DeviceSelector
                        onSelectDevice={(device) => {
                          setSelectedDevice(device);
                          setPreviewNumber(item);
                        }}
                      />
                      <button className="bg-green-500 p-2 rounded-full hover:bg-green-600 transition-colors">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openDialer()}
                        className="bg-yellow-400 p-2 rounded-full hover:bg-yellow-500 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-black"
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
                      </button>
                      <button
                        onClick={() => {
                          const shareData = {
                            title: `Golden Number: ${item.number}`,
                            text: `Check out this golden number: ${item.number} - ${item.price}`,
                            url: window.location.href,
                          };
                          if (navigator.share) {
                            navigator.share(shareData).catch((err) => {
                              console.log("Error sharing:", err);
                            });
                          } else {
                            navigator.clipboard.writeText(
                              `${shareData.text} - ${shareData.url}`,
                            );
                            alert("Link copied to clipboard!");
                          }
                        }}
                        className="bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition-colors"
                        title="Share"
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
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      {previewNumber && (
        <CallPreviewModal
          isOpen={!!previewNumber}
          onClose={() => setPreviewNumber(null)}
          number={previewNumber.number}
          network={previewNumber.network}
          deviceType={selectedDevice}
        />
      )}
    </div>
  );
};

export default FeaturedNumbersList;
