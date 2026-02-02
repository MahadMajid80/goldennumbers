"use client";

import { useState } from "react";
import Image from "next/image";

type Carrier = "Jazz" | "Zong" | "Ufone" | "Telenor";

const carriers: Carrier[] = ["Jazz", "Zong", "Ufone", "Telenor"];

const getCarrierLogo = (carrier: Carrier) => {
  const logos: Record<Carrier, string> = {
    Jazz: "/jazz-logo.png",
    Zong: "/zong-logo (1).png",
    Ufone: "/ufone-logo (1).png",
    Telenor: "/telenor-logo-icon (3).png",
  };
  return logos[carrier];
};

const CarrierTabs = () => {
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier>("Jazz");

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {carriers.map((carrier) => (
            <button
              key={carrier}
              onClick={() => setSelectedCarrier(carrier)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                selectedCarrier === carrier
                  ? "bg-[#FFD700] text-black"
                  : "text-white hover:bg-gray-800"
              }`}
            >
              <Image
                src={getCarrierLogo(carrier)}
                alt={carrier}
                width={30}
                height={30}
                className="object-contain h-6"
              />
              <span>{carrier}</span>
              {selectedCarrier === carrier && (
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
        <button className="text-white p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CarrierTabs;

