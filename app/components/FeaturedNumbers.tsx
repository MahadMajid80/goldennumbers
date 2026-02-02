type NumberCard = {
  number: string;
  price: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
};

const featuredNumbers: NumberCard[] = [
  { number: "0300-7888999", price: "Rs 150,000", network: "Jazz" },
  { number: "0300-555 8888", price: "Rs 375,000", network: "Jazz" },
  { number: "0300-1111 786", price: "Price On Call", network: "Jazz" },
  { number: "0322-2622222", price: "Rs 300,000", network: "Jazz" },
];

const FeaturedNumbers = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredNumbers.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
          >
            <div className="mb-4">
              <span className="text-orange-600 font-bold text-lg">Jazz</span>
            </div>
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-800">{item.number}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                {item.price}
              </span>
              {item.price === "Price On Call" && (
                <svg
                  className="w-6 h-6 text-gray-600"
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
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedNumbers;
