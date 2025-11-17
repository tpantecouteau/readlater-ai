"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname(); // ← pour re-check auth quand route change
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  // Vérifier auth à chaque navigation
  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setIsAuth(data.authenticated);
    }
    checkAuth();
  }, [pathname]); // ← IMPORTANT

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuth(false); // ← force l'UI à se mettre à jour IMMÉDIATEMENT
    router.replace("/login");
  }

  return (
    <header className="w-full border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-lg font-semibold tracking-wide">
          ReadLaterAI
        </a>

        {isAuth && (
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1 border border-neutral-700 rounded hover:bg-neutral-800"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
