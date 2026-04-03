/**
 * Normalizes admin "phone number" field input: allows letters, digits, spaces, hyphens.
 * Auto-inserts a single space after the first 4 digits only when in "formatted digit"
 * mode; see {@link shouldMergeAutoSpaceOnBackspace}.
 */
export const formatAdminPhoneNumberInput = (
  value: string,
  options: { preferDigitRunWithoutSpace: boolean },
): string => {
  const cleaned = value.replace(/[^a-zA-Z0-9\s-]/g, "");

  const collapseManual = (s: string): string =>
    s
      .replace(/\s{2,}/g, " ")
      .replace(/-{2,}/g, "-")
      .replace(/^[\s-]+/, "");

  // Any letter → freeform (no auto digit grouping).
  if (/[a-zA-Z]/.test(cleaned)) {
    return collapseManual(cleaned);
  }

  // User chose separators (space/hyphen) → preserve style, no auto re-grouping.
  if (cleaned.includes(" ") || cleaned.includes("-")) {
    return collapseManual(cleaned);
  }

  const digitsOnly = cleaned.replace(/\D/g, "");
  if (digitsOnly.length <= 4) {
    return digitsOnly;
  }

  if (options.preferDigitRunWithoutSpace) {
    return digitsOnly;
  }

  return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4)}`;
};

/**
 * True when Backspace/Delete would remove the auto-inserted space in "0300 123…" style.
 */
export const shouldMergeAutoSpaceOnBackspace = (value: string): boolean =>
  /^\d{4} \d+$/.test(value);

export const shouldMergeAutoSpaceOnDelete = (
  value: string,
  cursorPos: number,
): boolean => {
  if (cursorPos < 0 || cursorPos >= value.length) return false;
  return value[cursorPos] === " " && /^\d{4} \d+$/.test(value);
};
