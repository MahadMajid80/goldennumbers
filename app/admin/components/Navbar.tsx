"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <nav className="bg-gray-900 dark:bg-gray-900 bg-white border-b border-gray-800 dark:border-gray-800 border-gray-200 px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        <Image
          src="/Golden numbers Hub Logo White  (1).png"
          alt="Golden Numbers Logo"
          width={150}
          height={150}
          className="object-contain"
        />
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-800 dark:bg-gray-700 bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
          <span className="text-gray-300 dark:text-gray-300 text-gray-700">{session?.user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

