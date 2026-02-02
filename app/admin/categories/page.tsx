"use client";

import { useEffect, useState } from "react";
import CategoryModal from "./components/CategoryModal";
import DeleteModal from "../components/DeleteModal";

type Category = {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  createdAt?: string;
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/categories/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(categories.filter((c) => c._id !== deleteId));
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Categories Management</h1>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="bg-[#FFD700] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#FFA500] transition-colors"
        >
          + Add New Category
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category._id}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-[#FFD700] transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-gray-400 text-sm">/{category.slug}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  category.status === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-600 text-white"
                }`}
              >
                {category.status}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category._id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <CategoryModal
          category={selectedCategory}
          onClose={handleModalClose}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
          }}
          title="Delete Category"
          message="Are you sure you want to delete this category? This action cannot be undone. Categories with associated numbers cannot be deleted."
        />
      )}
    </div>
  );
};

export default CategoriesPage;

