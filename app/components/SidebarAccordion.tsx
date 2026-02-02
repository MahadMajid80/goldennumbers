"use client";

import { useState } from "react";
import Image from "next/image";
import { openWhatsApp } from "./utils";

type NumberItem = {
  number: string;
  price: string;
};

type Category = {
  id: string;
  title: string;
  items: NumberItem[];
};

const categories: Category[] = [
  {
    id: "golden",
    title: "Golden Numbers",
    items: [
      { number: "0300-241 0000", price: "Rs 90,000" },
      { number: "0300-7757777", price: "Rs 250,000" },
      { number: "03 000 222 000", price: "Price On Call" },
    ],
  },
  {
    id: "silver",
    title: "Silver Numbers",
    items: [
      { number: "032 25 25 25 25", price: "Rs 65,000" },
      { number: "0333-1234567", price: "Rs 85,000" },
    ],
  },
  {
    id: "platinum",
    title: "Platinum Numbers",
    items: [
      { number: "0300-9999999", price: "Rs 500,000" },
      { number: "0321-8888888", price: "Price On Call" },
    ],
  },
  {
    id: "diamond",
    title: "Diamond Numbers",
    items: [
      { number: "0300-0000000", price: "Price On Call" },
      { number: "0321-1111111", price: "Rs 1,000,000" },
    ],
  },
];

const SidebarAccordion = () => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setOpenCategory(openCategory === id ? null : id);
  };

  return (
    <div className="w-full">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-[#FFD700]">
        <h3 className="text-xl font-bold text-white mb-4">
          Number Categories
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="border-2 border-[#FFD700] rounded">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700 transition-colors"
              >
                <span className="font-semibold text-white">
                  {category.title}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openCategory === category.id ? "rotate-45" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              {openCategory === category.id && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {category.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-900 rounded-lg p-4 shadow-lg border-2 border-[#FFD700] hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="mb-3 flex justify-center">
                          <Image
                            src="/jazz-logo.png"
                            alt="Jazz"
                            width={60}
                            height={30}
                            className="object-contain h-10 group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="mb-3 text-center">
                          <p className="text-xl font-bold text-[#FFD700] group-hover:text-[#FFA500] transition-colors duration-300">
                            {item.number}
                          </p>
                        </div>
                        <div className="flex items-center justify-center">
                          {item.price === "Price On Call" ? (
                            <button 
                              onClick={openWhatsApp}
                              className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors duration-300 flex items-center gap-2 group-hover:scale-105"
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
                          ) : (
                            <span className="text-base font-semibold text-gray-300 group-hover:text-white transition-colors duration-300">
                              {item.price}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarAccordion;

