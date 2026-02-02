"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const SettingsPage = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Role</label>
            <input
              type="text"
              value={session?.user?.role || ""}
              disabled
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Information</h2>
        <div className="space-y-2 text-gray-300">
          <p>Version: 1.0.0</p>
          <p>Database: MongoDB</p>
          <p>Framework: Next.js 16</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

