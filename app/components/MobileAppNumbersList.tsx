"use client";

import Image from "next/image";
import { openWhatsApp } from "./utils";

type NumberItem = {
  id: number;
  number: string;
  price: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Zong";
  tags: string[];
};

const numbers: NumberItem[] = [
  {
    id: 1,
    number: "03014230170",
    price: "Rs 40,000",
    network: "Jazz",
    tags: ["Exclusive"],
  },
  {
    id: 2,
    number: "0301-12 14 72 5",
    price: "Rs 75,000",
    network: "Jazz",
    tags: ["Exclusive"],
  },
  {
    id: 3,
    number: "0323-3339333",
    price: "Rs 65,000",
    network: "Jazz",
    tags: ["To Remember", "X3", "Triplet"],
  },
];

const getNetworkLogo = (network: string) => {
  const logos: Record<string, string> = {
    Jazz: "/jazz-logo.png",
    Ufone: "/ufone-logo (1).png",
    Telenor: "/telenor-logo-icon (3).png",
    Zong: "/zong-logo (1).png",
  };
  return logos[network] || "/jazz-logo.png";
};

const MobileAppNumbersList = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-4">
        {numbers.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800 rounded-lg p-5 flex items-center justify-between hover:bg-gray-700 transition-colors duration-300"
          >
            <div className="flex items-center gap-4 flex-1">
              <Image
                src={getNetworkLogo(item.network)}
                alt={item.network}
                width={50}
                height={50}
                className="object-contain h-12"
              />
              <div className="flex-1">
                <p className="text-xl font-bold text-white mb-2">{item.number}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[#FFD700] text-black px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-bold text-white">{item.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={openWhatsApp}
                    className="bg-green-600 p-2 rounded-full hover:bg-green-700 transition-colors"
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
                    className="bg-[#FFD700] p-2 rounded-full hover:bg-[#FFA500] transition-colors"
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileAppNumbersList;

