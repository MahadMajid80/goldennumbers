export const openWhatsApp = (): void => {
    const phoneNumber = "923211111118";
    const message = encodeURIComponent("Hello, I'm interested in purchasing a golden number.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
};

