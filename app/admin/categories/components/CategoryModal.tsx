"use client";

import { useState, useEffect } from "react";

type Category = {
  _id?: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
};

type CategoryModalProps = {
  category: Category | null;
  onClose: () => void;
};

const CategoryModal = ({ category, onClose }: CategoryModalProps) => {
  const [formData, setFormData] = useState<Category>({
    name: "",
    slug: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        status: category.status,
      });
    }
  }, [category]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: category ? formData.slug : generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = category?._id
        ? `/api/admin/categories/${category._id}`
        : "/api/admin/categories";
      const method = category?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save category");
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {category ? "Edit Category" : "Add New Category"}
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
          <div>
            <label className="block text-gray-300 mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
              placeholder="Golden Numbers"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: generateSlug(e.target.value) })
              }
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
              placeholder="golden-numbers"
            />
            <p className="text-gray-500 text-sm mt-1">
              URL-friendly version (auto-generated from name)
            </p>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Category["status"],
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#FFD700] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#FFA500] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : category ? "Update" : "Create"}
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
    </div>
  );
};

export default CategoryModal;

