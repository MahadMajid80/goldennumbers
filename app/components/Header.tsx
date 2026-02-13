"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { openWhatsApp } from "./utils";

const Header = () => {
  const [isNetworksOpen, setIsNetworksOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileNetworksOpen, setIsMobileNetworksOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsNetworksOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isNetworksOpen || isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNetworksOpen, isMobileMenuOpen]);

  return (
    <header className="w-full">
      <nav className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/Golden numbers Hub Logo White  (1).png"
                alt="Golden Numbers Logo"
                width={200}
                height={200}
                className="object-contain"
              />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-white hover:text-[#FFD700] transition-colors"
              >
                Home
              </Link>
              <div className="relative group" ref={dropdownRef}>
                <button
                  onClick={() => setIsNetworksOpen(!isNetworksOpen)}
                  className="text-white hover:text-[#FFD700] transition-colors flex items-center gap-1"
                >
                  Networks
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isNetworksOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isNetworksOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                    <Link
                      href="/jazz"
                      className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-[#FFD700] transition-colors first:rounded-t-lg"
                    >
                      Jazz
                    </Link>
                    <Link
                      href="/ufone"
                      className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-[#FFD700] transition-colors"
                    >
                      Ufone
                    </Link>
                    <Link
                      href="/zong"
                      className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-[#FFD700] transition-colors"
                    >
                      Zong
                    </Link>
                    <Link
                      href="/telenor"
                      className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-[#FFD700] transition-colors last:rounded-b-lg"
                    >
                      Telenor
                    </Link>
                  </div>
                )}
              </div>
              <Link
                href="/about"
                className="text-white hover:text-[#FFD700] transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-white hover:text-[#FFD700] transition-colors"
              >
                Contact Us
              </Link>
              <button
                onClick={openWhatsApp}
                className="flex items-center gap-2 bg-[#FFD700] text-black px-4 py-2 rounded-full font-semibold border-2 border-transparent hover:bg-black hover:border-[#FFD700] hover:text-white transition-all shadow-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span className="text-base font-medium">+92-321-111-111-8</span>
              </button>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black z-[9998] md:hidden transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "opacity-50 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        {/* Slide Menu */}
        <div
          ref={mobileMenuRef}
          className={`fixed top-0 right-0 h-full w-64 bg-gray-900 z-[9999] md:hidden transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <Image
                src="/Golden numbers Hub Logo White  (1).png"
                alt="Golden Numbers Logo"
                width={120}
                height={60}
                className="object-contain h-8"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-[#FFD700] transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-[#FFD700] transition-colors rounded-lg"
              >
                Home
              </Link>
              <div>
                <button
                  onClick={() => setIsMobileNetworksOpen(!isMobileNetworksOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-gray-800 hover:text-[#FFD700] transition-colors rounded-lg"
                >
                  <span>Networks</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isMobileNetworksOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isMobileNetworksOpen && (
                  <div className="pl-4 mt-2 space-y-1">
                    <Link
                      href="/jazz"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileNetworksOpen(false);
                      }}
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-[#FFD700] transition-colors rounded-lg"
                    >
                      Jazz
                    </Link>
                    <Link
                      href="/ufone"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileNetworksOpen(false);
                      }}
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-[#FFD700] transition-colors rounded-lg"
                    >
                      Ufone
                    </Link>
                    <Link
                      href="/zong"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileNetworksOpen(false);
                      }}
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-[#FFD700] transition-colors rounded-lg"
                    >
                      Zong
                    </Link>
                    <Link
                      href="/telenor"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileNetworksOpen(false);
                      }}
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-[#FFD700] transition-colors rounded-lg"
                    >
                      Telenor
                    </Link>
                  </div>
                )}
              </div>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-[#FFD700] transition-colors rounded-lg"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-[#FFD700] transition-colors rounded-lg"
              >
                Contact Us
              </Link>
              <button
                onClick={() => {
                  openWhatsApp();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 bg-[#FFD700] text-black font-semibold border-2 border-transparent hover:bg-black hover:border-[#FFD700] hover:text-white transition-all rounded-lg shadow-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span className="text-base font-medium">+92-321-111-111-8</span>
              </button>
            </div>
          </div>
        </div>
      </>
    </header>
  );
};

export default Header;
