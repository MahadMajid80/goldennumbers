"use client";

import { useEffect, useState } from "react";
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
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-gray-700 border-t-[#FFD700] rounded-full animate-spin"></div>
            <p className="text-white font-semibold tracking-wide">
              Loading Golden Numbers...
            </p>
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
