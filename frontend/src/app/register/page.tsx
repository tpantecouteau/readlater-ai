"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr("");

        if (password !== confirmPassword) {
            setErr("Les mots de passe ne correspondent pas");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErr(data.error || "Erreur lors de l&apos;inscription");
                return;
            }

            // Redirect to login after successful registration
            window.location.href = "/login";
        } catch {
            setErr("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={onSubmit} className="w-80 space-y-3">
                <h1 className="text-xl font-semibold">Inscription</h1>
                {err && <p className="text-red-500 text-sm">{err}</p>}
                <input
                    className="w-full px-3 py-2 rounded bg-neutral-800"
                    placeholder="Nom d&apos;utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    className="w-full px-3 py-2 rounded bg-neutral-800"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="w-full px-3 py-2 rounded bg-neutral-800"
                    placeholder="Mot de passe"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    className="w-full px-3 py-2 rounded bg-neutral-800"
                    placeholder="Confirmer le mot de passe"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button
                    className="w-full py-2 bg-indigo-600 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Inscription..." : "S'inscrire"}
                </button>
                <p className="text-sm text-center text-neutral-400">
                    Déjà un compte ?{" "}
                    <Link href="/login" className="text-indigo-400 hover:underline">
                        Se connecter
                    </Link>
                </p>
            </form>
        </div>
    );
}
