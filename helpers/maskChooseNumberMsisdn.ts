import type { NumberMaskMode } from "@/models/ChooseNumberSettings";

const DIGIT_PATTERN = /\d/g;

const maskMiddleThreeDigits = (msisdn: string): string => {
  const digits = msisdn.replace(/\D+/g, "");
  if (digits.length !== 11 || !digits.startsWith("03")) return msisdn;

  const prefix = digits.slice(0, 4);
  const middle = digits.slice(4, 7);
  const suffix = digits.slice(7);
  const maskedMiddle = middle.replace(DIGIT_PATTERN, "*");
  return `${prefix}${maskedMiddle}${suffix}`;
};

const maskLastThreeDigits = (msisdn: string): string => {
  const digits = msisdn.replace(/\D+/g, "");
  if (digits.length !== 11 || !digits.startsWith("03")) return msisdn;

  const visible = digits.slice(0, 8);
  return `${visible}***`;
};

const maskLastSevenDigits = (msisdn: string): string => {
  const digits = msisdn.replace(/\D+/g, "");
  if (digits.length !== 11 || !digits.startsWith("03")) return msisdn;

  const visible = digits.slice(0, 4);
  return `${visible}*******`;
};

export const maskChooseNumberMsisdn = (
  msisdn: string,
  maskMode: NumberMaskMode,
): string => {
  if (maskMode === "middle3") return maskMiddleThreeDigits(msisdn);
  if (maskMode === "last3") return maskLastThreeDigits(msisdn);
  if (maskMode === "last7") return maskLastSevenDigits(msisdn);
  return msisdn;
};
