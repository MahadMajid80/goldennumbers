"use client";

import { useState } from "react";
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

  return (
    <div className="min-h-screen">
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
        <div className="container mx-auto px-4 pt-2 pb-8">
          <div className="mb-8">
            <div className="space-y-8">
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
