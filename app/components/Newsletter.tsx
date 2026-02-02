"use client";

import { useState } from "react";

const Newsletter = () => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-[#FFD700] rounded-lg p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-black text-center mb-6">
          ENTER YOUR CONTACT NUMBER AND SUBSCRIBE TO OUR NEWS LETTER
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="tel"
            placeholder="e.g. 03214455667"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="bg-black text-[#FFD700] px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
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
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;

