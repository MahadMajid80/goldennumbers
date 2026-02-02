"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CallPreviewModal from "./CallPreviewModal";
import DeviceSelector, { DeviceType } from "./DeviceSelector";
import { openWhatsApp } from "./utils";

type NumberItem = {
  _id: string;
  number: string;
  price: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  categoryId?: Array<{ _id: string; name: string }>;
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

type NetworkNumbersListProps = {
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
};

const NetworkNumbersList = ({ network }: NetworkNumbersListProps) => {
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [previewNumber, setPreviewNumber] = useState<NumberItem | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("iphone-14-pro-max");

  useEffect(() => {
    fetchNumbers();
    fetchCategories();
  }, [network]);

  const fetchNumbers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/numbers?network=${network}`);
      const data = await response.json();
      setNumbers(data);
    } catch (error) {
      console.error("Error fetching numbers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filters = ["All", ...categories.map((cat) => cat.name)];

  let filteredNumbers = numbers;

  if (activeFilter !== "All") {
    filteredNumbers = filteredNumbers.filter((num) =>
      num.categoryId?.some((cat) => cat.name === activeFilter)
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white text-center py-12">
          Loading numbers...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6">
        <div className="mb-6">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max pb-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors shadow-sm whitespace-nowrap flex-shrink-0 ${
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
        {filteredNumbers.length === 0 ? (
          <div className="text-white text-center py-12">
            No numbers available for {network}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNumbers.map((item) => (
              <div
                key={item._id}
                className="bg-gray-800 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-750 transition-all duration-300"
              >
              <div className="flex items-center gap-4 flex-1">
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
                  <span className="text-base font-semibold text-gray-400">
                    {item.price}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold text-white mb-2">
                    {item.price}
                  </p>
                  <div className="flex items-center gap-2">
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
                      onClick={openWhatsApp}
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
                            `${shareData.text} - ${shareData.url}`
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
              </div>
            </div>
          ))}
          </div>
        )}
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

export default NetworkNumbersList;

