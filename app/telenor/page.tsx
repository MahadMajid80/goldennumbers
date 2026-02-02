import Header from "../components/Header";
import SearchBanner from "../components/SearchBanner";
import NetworkNumbersList from "../components/NetworkNumbersList";
import Image from "next/image";

export default function TelenorPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <SearchBanner />
        <div className="container mx-auto px-4 pt-2 pb-8">
          <div className="mb-6 flex justify-center">
            <Image
              src="/telenor-logo-icon (3).png"
              alt="Telenor"
              width={400}
              height={200}
              className="object-contain h-40 md:h-48 hover:scale-110 hover:rotate-3 transition-all duration-300"
            />
          </div>
          <NetworkNumbersList network="Telenor" />
        </div>
      </main>
    </div>
  );
}

