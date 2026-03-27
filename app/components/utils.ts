export const openWhatsApp = (): void => {
  if (typeof window === "undefined") return;
  
  const phoneNumber = "923211111118";
  const message = encodeURIComponent("Hello, I'm interested in purchasing a golden number.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(whatsappUrl, "_blank");
};

export const openDialer = (phoneNumber: string): void => {
  if (typeof window === "undefined") return;

  const normalizedNumber = phoneNumber.replace(/[^\d+]/g, "");
  if (!normalizedNumber) return;

  window.location.href = `tel:${normalizedNumber}`;
};

