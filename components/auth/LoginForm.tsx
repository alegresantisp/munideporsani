"use client";

import { useState } from "react";
import { getFirebaseClient } from "@/lib/firebase/clientApp";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { auth } = getFirebaseClient();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("No se pudo crear la sesión");
      }

      // Redirige al admin
      window.location.href = "/admin";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al iniciar sesión. Verificá tus datos.",
      );
      // Cerrar sesión localmente en caso de error de sesión
      try {
        const { auth } = getFirebaseClient();
        await signOut(auth);
      } catch {
        // ignorar
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 text-xs"
    >
      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700"
        >
          Correo institucional
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="password"
          className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
        />
      </div>

      {error && <p className="text-[11px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-sky-700 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}


