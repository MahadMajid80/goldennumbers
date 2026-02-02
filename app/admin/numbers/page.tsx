"use client";

import { useEffect, useState } from "react";
import NumberModal from "./components/NumberModal";
import DeleteModal from "../components/DeleteModal";

type Number = {
  _id: string;
  number: string;
  categoryId: {
    _id: string;
    name: string;
  } | {
    _id: string;
    name: string;
  }[];
  price: string;
  status: "available" | "pre-owned";
  tags: string[];
  description?: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  limitedOffer?: boolean;
};

type Category = {
  _id: string;
  name: string;
  slug: string;
};

const NumbersPage = () => {
  const [numbers, setNumbers] = useState<Number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<Number | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    fetchNumbers();
    fetchCategories();
  }, []);

  const fetchNumbers = async () => {
    try {
      const response = await fetch("/api/admin/numbers");
      const data = await response.json();
      setNumbers(data);
    } catch (error) {
      console.error("Error fetching numbers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleEdit = (number: Number) => {
    setSelectedNumber(number);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/numbers/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNumbers(numbers.filter((n) => n._id !== deleteId));
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete number");
      }
    } catch (error) {
      console.error("Error deleting number:", error);
      alert("Failed to delete number");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNumber(null);
    fetchNumbers();
  };

  const filteredNumbers = numbers.filter((num) => {
    const matchesSearch =
      num.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      num.price.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || num.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" ||
      (Array.isArray(num.categoryId)
        ? num.categoryId.some((cat) => cat._id === filterCategory)
        : num.categoryId._id === filterCategory);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Numbers Management</h1>
        <button
          onClick={() => {
            setSelectedNumber(null);
            setIsModalOpen(true);
          }}
          className="bg-[#FFD700] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#FFA500] transition-colors"
        >
          + Add New Number
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="pre-owned">Pre-Owned</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-white font-semibold">
                  Number
                </th>
                <th className="px-6 py-3 text-left text-white font-semibold">
                  Network
                </th>
                <th className="px-6 py-3 text-left text-white font-semibold">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-white font-semibold">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-white font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-white font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredNumbers.map((num) => (
                <tr
                  key={num._id}
                  className="border-b border-gray-800 hover:bg-gray-800"
                >
                  <td className="px-6 py-4 text-white font-semibold">
                    {num.number}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{num.network}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {Array.isArray(num.categoryId) ? (
                      <div className="flex flex-wrap gap-1">
                        {num.categoryId.map((cat, idx) => (
                          <span
                            key={cat._id || idx}
                            className="bg-[#FFD700] text-black px-2 py-1 rounded-full text-xs font-semibold"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      num.categoryId?.name || "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{num.price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        num.status === "available"
                          ? "bg-green-600 text-white"
                          : "bg-orange-600 text-white"
                      }`}
                    >
                      {num.status === "pre-owned" ? "Pre-Owned" : num.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(num)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(num._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <NumberModal
          number={selectedNumber}
          categories={categories}
          onClose={handleModalClose}
          onCategoryAdded={fetchCategories}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
          }}
          title="Delete Number"
          message="Are you sure you want to delete this number? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default NumbersPage;

