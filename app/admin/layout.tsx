"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./contexts/ThemeContext";

function AdminPanelContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black dark:bg-black bg-gray-50 transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-black dark:bg-black bg-gray-50 transition-colors">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage && status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#FFD700] text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <ThemeProvider>
      <AdminPanelContent>{children}</AdminPanelContent>
    </ThemeProvider>
  );
}

