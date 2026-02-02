"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg border-2 border-[#FFD700] p-8 md:p-12 shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-black uppercase text-center mb-8">
              THE CONCEPT
            </h1>
            <p className="text-black text-base md:text-lg leading-relaxed text-left">
              driven by master demand, the concept of Golden Numbers is simple:
              bring master(VIP) number lovers together on a platform to complete
              their search for charming, attractive and easy phone numbers. We
              deal in all networks compatible within Pakistan and our stock
              consists of the numbers of All Types according to your desire
              that includes Premium, Golden, Silver, Platinum and Diamond
              respectively. Our stock-category offers Triple, Tetra, Penta,
              Hexa, Hepta, Octa, Double-Tetra and Repeating-Pair numbers. And
              if you reach on top of the all, you can also reach us through any
              medium and ask for your desired number (that is not even in
              stock), we will make sure to fulfill your desire and continue our
              tradition of buiding strong customer connectivity.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;

