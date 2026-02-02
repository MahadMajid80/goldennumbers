import Header from "../components/Header";
import SearchBanner from "../components/SearchBanner";
import NetworkNumbersList from "../components/NetworkNumbersList";
import Image from "next/image";

export default function WaridPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <SearchBanner />
        <div className="container mx-auto px-4 pt-2 pb-8">
          <div className="mb-6 flex justify-center">
            <Image
              src="/596_warid_telecom_logo-Photoroom (1).png"
              alt="Warid"
              width={350}
              height={175}
              className="object-contain h-36 md:h-44 hover:scale-110 hover:rotate-3 transition-all duration-300"
            />
          </div>
          <NetworkNumbersList network="Warid" />
        </div>
      </main>
    </div>
  );
}

