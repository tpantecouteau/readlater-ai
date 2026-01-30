"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: new URLSearchParams({ username, password }),
    });
    if (!res.ok) {
      setErr("Identifiants invalides");
      return;
    }
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center">Connexion</h1>
        {err && <p className="text-red-500 text-sm text-center">{err}</p>}
        <input
          className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none transition"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setU(e.target.value)}
        />
        <input
          className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none transition"
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setP(e.target.value)}
        />
        <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">
          Se connecter
        </button>
        <p className="text-sm text-center text-neutral-400">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            S'inscrire
          </Link>
        </p>
        <div className="mt-6 pt-4 border-t border-neutral-700">
          <p className="text-xs text-center text-neutral-500">
            🧩 Extension Chrome bientôt disponible
          </p>
        </div>
      </form>
    </div>
  );
}
