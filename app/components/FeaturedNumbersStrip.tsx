"use client";

import { openWhatsApp } from "./utils";

const FeaturedNumbersStrip = () => {
  const renderStrip = () => (
    <div className="bg-black border border-gray-600 rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg p-2 flex-shrink-0">
          <div className="w-8 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded border-2 border-black/20 relative">
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-1 p-1">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-black rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-sm"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-black rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-sm"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-black rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-white text-lg font-semibold">10% off</span>
          <span className="text-gray-300 text-sm">First sim Booking</span>
        </div>
      </div>
      <button 
        onClick={openWhatsApp}
        className="bg-transparent text-white px-6 py-2 rounded-lg font-medium hover:text-gray-200 transition-colors whitespace-nowrap border border-gray-600"
      >
        Order Now
      </button>
    </div>
  );

  return (
    <div className="w-full py-4 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderStrip()}
          <div className="hidden md:block">
            {renderStrip()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNumbersStrip;

