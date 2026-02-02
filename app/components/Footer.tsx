"use client";

import { useState } from "react";
import Image from "next/image";

const Footer = () => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing with:", phoneNumber);
  };

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              WANT TO GET UPDATED FOR MORE GOLDEN NUMBERS IN FUTURE?
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Enter your contact number and subscribe
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 03214455667"
                className="flex-1 px-4 py-2 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              />
              <button
                type="submit"
                className="bg-[#FFA500] hover:bg-[#FF8C00] p-2 rounded-lg transition-colors"
                aria-label="Subscribe"
              >
                <svg
                  className="w-6 h-6 text-white"
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
            </form>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="flex flex-nowrap md:flex-wrap gap-3 md:gap-4 items-center overflow-x-auto scrollbar-hide">
              <div className="bg-white rounded-lg p-3 flex items-center justify-center h-20 w-28 md:w-32 flex-shrink-0">
                <Image
                  src="/aa6f71db41f159a4b56a81cd41aa0c1f.png"
                  alt="Jazz Cash"
                  width={120}
                  height={60}
                  className="object-contain h-full w-full"
                />
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center h-20 w-28 md:w-32 flex-shrink-0">
                <Image
                  src="/d84b9db32c8cf3ce14582c2037ac58c0.png"
                  alt="easypaisa"
                  width={120}
                  height={60}
                  className="object-contain h-full w-full"
                />
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center h-20 w-28 md:w-32 flex-shrink-0">
                <Image
                  src="/pngfind.com-bank-png-1675110.png"
                  alt="UBL"
                  width={120}
                  height={60}
                  className="object-contain h-full w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-300">
            Copyright 2026 @ Golden Numbers Pakistan.
          </p>
          <div className="flex gap-4 text-sm">
            <a href="/" className="hover:text-[#FFD700] transition-colors">
              Home
            </a>
            <a href="/about" className="hover:text-[#FFD700] transition-colors">
              About
            </a>
            <a href="/contact" className="hover:text-[#FFD700] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

