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
      setErr("Invalid credentials");
      return;
    }
    window.location.href = "/"; // simple & fiable
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-80 space-y-3">
        <h1 className="text-xl font-semibold">Login</h1>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <input
          className="w-full px-3 py-2 rounded bg-neutral-800"
          placeholder="username"
          value={username}
          onChange={(e) => setU(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 rounded bg-neutral-800"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setP(e.target.value)}
        />
        <button className="w-full py-2 bg-indigo-600 rounded">
          Se connecter
        </button>
        <p className="text-sm text-center text-neutral-400">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            S'inscrire
          </Link>
        </p>
      </form>
    </div>
  );
}

