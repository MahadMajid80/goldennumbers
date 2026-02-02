import Header from "../components/Header";
import SearchBanner from "../components/SearchBanner";
import NetworkNumbersList from "../components/NetworkNumbersList";
import Image from "next/image";

export default function JazzPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <SearchBanner />
        <div className="container mx-auto px-4 pt-2 pb-8">
          <div className="mb-6 flex justify-center">
            <Image
              src="/jazz-logo.png"
              alt="Jazz"
              width={300}
              height={150}
              className="object-contain h-32 md:h-40 hover:scale-110 hover:rotate-3 transition-all duration-300"
            />
          </div>
          <NetworkNumbersList network="Jazz" />
        </div>
      </main>
    </div>
  );
}

