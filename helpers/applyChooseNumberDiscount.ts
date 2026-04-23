const extractPriceAmount = (price: string): number | null => {
  const normalized = price.replace(/,/g, "").trim();
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount < 0) return null;

  return amount;
};

const formatRupeeAmount = (amount: number): string => {
  const rounded = Math.round(amount);
  return `Rs ${rounded.toLocaleString("en-PK")}`;
};

export const applyChooseNumberDiscount = (
  price: string,
  discountPercentage: number,
): string => {
  if (!price || /price on call/i.test(price)) return price;
  if (!Number.isFinite(discountPercentage) || discountPercentage <= 0) return price;

  const amount = extractPriceAmount(price);
  if (amount === null) return price;

  const discounted = Math.max(0, amount - amount * (discountPercentage / 100));
  return formatRupeeAmount(discounted);
};
