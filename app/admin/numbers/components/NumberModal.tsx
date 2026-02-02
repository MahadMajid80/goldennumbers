"use client";

import { useState, useEffect } from "react";
import CategoryModal from "../../categories/components/CategoryModal";

type Number = {
  _id?: string;
  number: string;
  categoryId:
    | string
    | string[]
    | { _id: string; name?: string }
    | { _id: string; name?: string }[];
  price: string;
  status: "available" | "pre-owned";
  tags: string[];
  description?: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  limitedOffer?: boolean;
  premiumNumber?: boolean;
  featuredNumber?: boolean;
};

type Category = {
  _id: string;
  name: string;
};

type NumberModalProps = {
  number: Number | null;
  categories: Category[];
  onClose: () => void;
  onCategoryAdded?: () => void;
};

const NumberModal = ({
  number,
  categories,
  onClose,
  onCategoryAdded,
}: NumberModalProps) => {
  const [formData, setFormData] = useState<{
    number: string;
    categoryId: string[];
    price: string;
    status: "available" | "pre-owned";
    tags: string[];
    description: string;
    network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
    limitedOffer: boolean;
    premiumNumber: boolean;
    featuredNumber: boolean;
  }>({
    number: "",
    categoryId: [],
    price: "Rs ",
    status: "available",
    tags: [],
    description: "",
    network: "Jazz",
    limitedOffer: false,
    premiumNumber: false,
    featuredNumber: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [priceOnCall, setPriceOnCall] = useState(false);

  useEffect(() => {
    if (number) {
      let categoryIds: string[] = [];
      if (Array.isArray(number.categoryId)) {
        categoryIds = number.categoryId.map(
          (cat: string | { _id: string; name?: string }) =>
            typeof cat === "object" && cat !== null ? cat._id : cat
        );
      } else if (number.categoryId) {
        categoryIds = [
          typeof number.categoryId === "object" && number.categoryId !== null
            ? (number.categoryId as { _id: string })._id
            : (number.categoryId as string),
        ];
      }

      const isPriceOnCall =
        number.price === "Price On Call" ||
        number.price.toLowerCase().includes("price on call");
      setPriceOnCall(isPriceOnCall);
      setFormData({
        number: formatPhoneNumber(number.number),
        categoryId: categoryIds,
        price: isPriceOnCall
          ? "Price On Call"
          : number.price.startsWith("Rs")
          ? number.price
          : "Rs " + number.price,
        status: number.status,
        tags: number.tags || [],
        description: number.description || "",
        network: number.network,
        limitedOffer: number.limitedOffer || false,
        premiumNumber: number.premiumNumber || false,
        featuredNumber: number.featuredNumber || false,
      });
    }
  }, [number]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = number?._id
        ? `/api/admin/numbers/${number._id}`
        : "/api/admin/numbers";
      const method = number?._id ? "PUT" : "POST";

      if (formData.categoryId.length === 0) {
        setError("Please select at least one category");
        setLoading(false);
        return;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save number");
      }

      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save number";
      setError(errorMessage);
      console.error("Error saving number:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const formatPhoneNumber = (value: string, previousValue?: string): string => {
    // Remove all non-digits to get the actual digit count
    const digitsOnly = value.replace(/\D/g, "");
    const previousDigitsOnly = previousValue
      ? previousValue.replace(/\D/g, "")
      : "";

    // If 4 digits or less, no space needed
    if (digitsOnly.length <= 4) {
      return digitsOnly;
    }

    // Check if user is typing (adding characters) or deleting
    const isTyping = digitsOnly.length > previousDigitsOnly.length;
    const isDeleting = previousValue && value.length < previousValue.length;

    // Check if current value has a space at position 4
    const currentHasSpace = value.length > 4 && value[4] === " ";

    // Check if previous value had a space
    const previousHadSpace =
      previousValue && previousValue.length > 4 && previousValue[4] === " ";

    // If user deleted the space, keep it removed
    if (isDeleting && previousHadSpace && !currentHasSpace) {
      return digitsOnly;
    }

    // If user is typing a NEW digit (digit count increased) and there's no space
    if (isTyping && !currentHasSpace) {
      // Only add space if we're crossing from exactly 4 to 5+ digits
      // This allows user to continue typing without space after removing it
      if (previousDigitsOnly.length === 4) {
        // User typed 5th digit, add space
        return digitsOnly.slice(0, 4) + " " + digitsOnly.slice(4);
      }
      // User removed space and is continuing to type, keep it without space
      return digitsOnly;
    }

    // If space exists, maintain the current format
    if (currentHasSpace) {
      return value;
    }

    // Standard case: ensure space is present after 4 digits
    return digitsOnly.slice(0, 4) + " " + digitsOnly.slice(4);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const previousValue = formData.number;
    const formatted = formatPhoneNumber(e.target.value, previousValue);
    setFormData({ ...formData, number: formatted });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {number ? "Edit Number" : "Add New Number"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Phone Number *</label>
              <input
                type="text"
                value={formData.number}
                onChange={handleNumberChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
                placeholder="0300 1234567"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Network *</label>
              <select
                value={formData.network}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    network: e.target.value as Number["network"],
                  })
                }
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
              >
                <option value="Jazz">Jazz</option>
                <option value="Ufone">Ufone</option>
                <option value="Telenor">Telenor</option>
                <option value="Warid">Warid</option>
                <option value="Zong">Zong</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-300">Categories *</label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-[#FFD700] hover:text-[#FFA500] text-sm font-semibold flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add New Category
                </button>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <label
                    key={cat._id}
                    className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-700 rounded px-2"
                  >
                    <input
                      type="checkbox"
                      checked={formData.categoryId.includes(cat._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            categoryId: [...formData.categoryId, cat._id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            categoryId: formData.categoryId.filter(
                              (id) => id !== cat._id
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 text-[#FFD700] bg-gray-700 border-gray-600 rounded focus:ring-[#FFD700]"
                    />
                    <span className="text-white">{cat.name}</span>
                  </label>
                ))}
              </div>
              {formData.categoryId.length === 0 && (
                <p className="text-red-400 text-sm mt-1">
                  Please select at least one category
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  Rs
                </span>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (!value.startsWith("Rs") && value !== "Price On Call") {
                      value = value.startsWith("Rs ")
                        ? value
                        : "Rs " + value.replace(/^Rs\s*/, "");
                    }
                    setFormData({ ...formData, price: value });
                    if (value !== "Price On Call") {
                      setPriceOnCall(false);
                    }
                  }}
                  onFocus={() => {
                    if (
                      !formData.price ||
                      formData.price === "" ||
                      formData.price === "Price On Call"
                    ) {
                      setFormData({ ...formData, price: "Rs " });
                      setPriceOnCall(false);
                    }
                  }}
                  required={!priceOnCall}
                  disabled={priceOnCall}
                  className={`w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-2 text-white focus:outline-none focus:border-[#FFD700] ${
                    priceOnCall ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  placeholder="100,000"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="priceOnCall"
                  checked={priceOnCall}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setPriceOnCall(checked);
                    if (checked) {
                      setFormData({ ...formData, price: "Price On Call" });
                    } else {
                      setFormData({ ...formData, price: "Rs " });
                    }
                  }}
                  className="w-4 h-4 text-[#FFD700] bg-gray-700 border-gray-600 rounded focus:ring-[#FFD700]"
                />
                <label
                  htmlFor="priceOnCall"
                  className="text-gray-300 cursor-pointer"
                >
                  Price on Call
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Number["status"],
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
            >
              <option value="available">Available</option>
              <option value="pre-owned">Pre-Owned</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
                placeholder="Add tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-[#FFD700] text-black px-4 py-2 rounded-lg hover:bg-[#FFA500] transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#FFD700] text-black px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
              placeholder="Optional description"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="limitedOffer"
                checked={formData.limitedOffer}
                onChange={(e) =>
                  setFormData({ ...formData, limitedOffer: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="limitedOffer" className="text-gray-300">
                Limited Offer
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="premiumNumber"
                checked={formData.premiumNumber}
                onChange={(e) =>
                  setFormData({ ...formData, premiumNumber: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="premiumNumber" className="text-gray-300">
                Premium Number
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featuredNumber"
                checked={formData.featuredNumber}
                onChange={(e) =>
                  setFormData({ ...formData, featuredNumber: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="featuredNumber" className="text-gray-300">
                Featured Numbers
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#FFD700] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#FFA500] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : number ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showCategoryModal && (
        <CategoryModal
          category={null}
          onClose={() => {
            setShowCategoryModal(false);
            if (onCategoryAdded) {
              onCategoryAdded();
            }
          }}
        />
      )}
    </div>
  );
};

export default NumberModal;
