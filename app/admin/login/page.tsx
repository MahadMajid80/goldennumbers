"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black dark:bg-black bg-gray-50 flex items-center justify-center transition-colors">
      <div className="bg-gray-900 dark:bg-gray-900 bg-white rounded-2xl p-8 w-full max-w-md border border-gray-800 dark:border-gray-800 border-gray-200 shadow-lg transition-colors">
        <div className="flex justify-center mb-6">
          <Image
            src="/Golden numbers Hub Logo White  (1).png"
            alt="Golden Numbers"
            width={200}
            height={200}
            className="object-contain"
          />
        </div>
        <p className="text-gray-400 dark:text-gray-400 text-gray-600 text-center mb-6">
          Sign in to access the admin dashboard
        </p>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 dark:text-gray-300 text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 dark:bg-gray-800 bg-gray-50 border border-gray-700 dark:border-gray-700 border-gray-300 rounded-lg px-4 py-3 text-white dark:text-white text-gray-900 focus:outline-none focus:border-[#FFD700] transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-300 dark:text-gray-300 text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 dark:bg-gray-800 bg-gray-50 border border-gray-700 dark:border-gray-700 border-gray-300 rounded-lg px-4 py-3 text-white dark:text-white text-gray-900 focus:outline-none focus:border-[#FFD700] transition-colors"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD700] text-black font-semibold py-3 rounded-lg hover:bg-[#FFA500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

