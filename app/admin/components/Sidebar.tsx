"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/numbers", label: "Numbers", icon: "📱" },
    { href: "/admin/categories", label: "Categories", icon: "📂" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 bg-gray-900 dark:bg-gray-900 bg-white border-r border-gray-800 dark:border-gray-800 border-gray-200 min-h-screen transition-colors">
      <div className="p-6">
        <h2 className="text-xl font-bold text-[#FFD700] dark:text-[#FFD700] text-gray-800 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-[#FFD700] text-black font-semibold"
                  : "text-gray-300 dark:text-gray-300 text-gray-700 hover:bg-gray-800 dark:hover:bg-gray-800 hover:bg-gray-100 hover:text-white dark:hover:text-white hover:text-gray-900"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

