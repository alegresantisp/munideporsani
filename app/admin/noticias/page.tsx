"use client";

import { useEffect, useState } from "react";
import type { Noticia } from "@/services/noticias/noticias.types";
import { toast } from "sonner";

export default function AdminNoticiasListPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNoticias = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/noticias/admin");
      if (!res.ok) {
        throw new Error("No se pudieron cargar las noticias");
      }
      const data = (await res.json()) as Noticia[];
      setNoticias(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error inesperado al cargar noticias",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNoticias();
  }, []);

  const toggleDestacado = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/noticias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destacado: !current }),
      });
      if (!res.ok) throw new Error();
      setNoticias((prev) =>
        prev.map((n) => (n.id === id ? { ...n, destacado: !current } : n)),
      );
      toast.success("Estado de destacado actualizado.");
    } catch {
      toast.error("No se pudo actualizar el destacado.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar esta noticia?")) return;
    try {
      const res = await fetch(`/api/noticias/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setNoticias((prev) => prev.filter((n) => n.id !== id));
      toast.success("Noticia eliminada.");
    } catch {
      toast.error("No se pudo eliminar la noticia.");
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
          Noticias
        </p>
        <h1 className="text-lg font-semibold text-slate-50">
          Listado de noticias deportivas
        </h1>
        <p className="text-xs text-slate-400">
          Administrá noticias existentes: destacados y eliminación.
        </p>
      </header>

      {loading && <p className="text-xs text-slate-300">Cargando noticias...</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {!loading && !noticias.length && (
        <p className="text-xs text-slate-300">No hay noticias cargadas.</p>
      )}

      {!loading && noticias.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-[0.14em] text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Título</th>
                <th className="px-3 py-2 text-left">Categoría</th>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Destacada</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {noticias.map((n) => (
                <tr
                  key={n.id}
                  className="border-t border-slate-800/60 hover:bg-slate-900/60"
                >
                  <td className="px-3 py-2 text-slate-50">
                    <span className="line-clamp-2">{n.titulo}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {n.categoria}
                  </td>
                  <td className="px-3 py-2 text-slate-400">
                    {new Date(n.fechaPublicacion).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    <button
                      type="button"
                      onClick={() => void toggleDestacado(n.id, n.destacado)}
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        n.destacado
                          ? "bg-sky-500/20 text-sky-200"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {n.destacado ? "Sí" : "No"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    <button
                      type="button"
                      onClick={() => void handleDelete(n.id)}
                      className="text-[11px] text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


