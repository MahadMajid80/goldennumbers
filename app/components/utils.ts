/** Business line for WhatsApp and phone dialer (+92-321-1111118). */
export const BUSINESS_PHONE_E164 = "923211111118";

export const openWhatsApp = (): void => {
  if (typeof window === "undefined") return;

  const message = encodeURIComponent(
    "Hello, I'm interested in purchasing a golden number.",
  );
  const whatsappUrl = `https://wa.me/${BUSINESS_PHONE_E164}?text=${message}`;
  window.open(whatsappUrl, "_blank");
};

/** Opens the device dialer with the business number only (not the listed number). */
export const openDialer = (): void => {
  if (typeof window === "undefined") return;

  window.location.href = `tel:+${BUSINESS_PHONE_E164}`;
};

