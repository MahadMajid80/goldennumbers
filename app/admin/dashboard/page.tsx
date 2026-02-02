"use client";

import { useEffect, useState } from "react";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalNumbers: 0,
    availableNumbers: 0,
    preOwnedNumbers: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white dark:text-white text-gray-800">Loading...</div>;
  }

  const statCards = [
    {
      title: "Total Numbers",
      value: stats.totalNumbers,
      color: "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200",
      textColor: "text-blue-700",
      icon: "📱",
    },
    {
      title: "Available",
      value: stats.availableNumbers,
      color: "bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200",
      textColor: "text-emerald-700",
      icon: "✅",
    },
    {
      title: "Pre-Owned",
      value: stats.preOwnedNumbers,
      color: "bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200",
      textColor: "text-orange-700",
      icon: "🔄",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      color: "bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200",
      textColor: "text-amber-700",
      icon: "📂",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white dark:text-white text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${stat.textColor} text-sm mb-1 font-medium opacity-80`}>{stat.title}</p>
                <p className={`${stat.textColor} text-3xl font-bold`}>{stat.value}</p>
              </div>
              <span className="text-4xl opacity-60">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;

