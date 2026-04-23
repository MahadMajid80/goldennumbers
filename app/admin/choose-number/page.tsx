"use client";

import { useEffect, useState } from "react";

type NumberMaskMode = "none" | "middle3" | "last3" | "last7";

type ChooseNumberSettingsResponse = {
  discountPercentage: number;
  maskMode: NumberMaskMode;
  updatedBy?: string | null;
  updatedAt?: string | null;
  error?: string;
};

const ChooseNumberSettingsPage = () => {
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [maskMode, setMaskMode] = useState<NumberMaskMode>("none");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatedMeta, setUpdatedMeta] = useState<{
    updatedBy?: string | null;
    updatedAt?: string | null;
  } | null>(null);

  const fetchSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/choose-number-settings");
      const data = (await response.json()) as ChooseNumberSettingsResponse;

      if (!response.ok || data.error) {
        setError(data.error ?? "Failed to load settings.");
        return;
      }

      setDiscountPercentage(String(data.discountPercentage ?? 0));
      setMaskMode(data.maskMode ?? "none");
      setUpdatedMeta({
        updatedBy: data.updatedBy ?? null,
        updatedAt: data.updatedAt ?? null,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const handleSave = async (): Promise<void> => {
    setSuccess(null);
    setError(null);

    const parsedDiscount = Number(discountPercentage);
    if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      setError("Discount must be between 0 and 100.");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/admin/choose-number-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discountPercentage: parsedDiscount,
          maskMode,
        }),
      });

      const data = (await response.json()) as ChooseNumberSettingsResponse;
      if (!response.ok || data.error) {
        setError(data.error ?? "Failed to save settings.");
        return;
      }

      setDiscountPercentage(String(data.discountPercentage));
      setMaskMode(data.maskMode);
      setUpdatedMeta({
        updatedBy: data.updatedBy ?? null,
        updatedAt: data.updatedAt ?? null,
      });
      setSuccess("Choose your number settings updated.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Choose Your Number Controls</h1>
        <p className="mt-2 text-sm text-gray-300">
          Manage global discount and phone masking shown on the public Choose Your
          Number section.
        </p>
      </div>

      <div className="rounded-lg bg-gray-900 p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/20 px-4 py-3 text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500/40 bg-green-950/20 px-4 py-3 text-green-300">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-300">
              Discount Percentage
            </span>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-[#FFD700] focus:outline-none"
              placeholder="0"
            />
            <span className="mt-1 block text-xs text-gray-400">
              Example: 10 means 10% off for all numeric prices.
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-300">
              Phone Number Masking
            </span>
            <select
              value={maskMode}
              onChange={(e) => setMaskMode(e.target.value as NumberMaskMode)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-[#FFD700] focus:outline-none"
            >
              <option value="none">Do not mask (show full number)</option>
              <option value="middle3">Hide middle 3 digits (0300***0000)</option>
              <option value="last3">Hide last 3 digits (03000000***)</option>
              <option value="last7">Hide last 7 digits (0300*******)</option>
            </select>
          </label>
        </div>

        {updatedMeta?.updatedAt && (
          <p className="mt-4 text-xs text-gray-400">
            Last updated by {updatedMeta.updatedBy ?? "admin"} on{" "}
            {new Date(updatedMeta.updatedAt).toLocaleString()}.
          </p>
        )}

        <div className="mt-6">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="rounded-full bg-[#FFD700] px-6 py-3 font-semibold text-black transition-colors hover:bg-[#FFA500] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseNumberSettingsPage;
