"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "./components/Header";
import SearchBanner from "./components/SearchBanner";
import FeaturedNumbersList from "./components/FeaturedNumbersList";
import FeaturedNumbersCards from "./components/FeaturedNumbersCards";
import FeaturedNumbersStrip from "./components/FeaturedNumbersStrip";
import OurPackages from "./components/OurPackages";
import BrowseNumbers from "./components/BrowseNumbers";
import PremiumNumbersTable from "./components/PremiumNumbersTable";
import InfoSections from "./components/InfoSections";
import Footer from "./components/Footer";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsInitialLoading(false);
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {isInitialLoading && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
          <div className="flex items-center justify-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-gray-700 border-t-[#FFD700] rounded-full animate-spin"></div>
              <Image
                src="/Golden numbers Hub Logo White  (1).png"
                alt="Golden Numbers Logo"
                width={44}
                height={44}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}
      <Header />
      <main>
        <SearchBanner
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedNetwork={selectedNetwork}
          setSelectedNetwork={setSelectedNetwork}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
        />
        <div className="pt-2 pb-8">
          <div className="mb-8">
            <div className="space-y-2 md:space-y-8">
              <FeaturedNumbersList
                searchTerm={searchTerm}
                selectedNetwork={selectedNetwork}
                setSelectedNetwork={setSelectedNetwork}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
              <FeaturedNumbersStrip />
              <FeaturedNumbersCards />
              <PremiumNumbersTable />
              <OurPackages />
              <BrowseNumbers />
              <InfoSections />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
