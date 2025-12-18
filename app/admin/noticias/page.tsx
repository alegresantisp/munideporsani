"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Noticia } from "@/services/noticias/noticias.types";
import Image from "next/image";
import Link from "next/link";

export default function AdminNoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNoticias = async () => {
    try {
      const res = await fetch("/api/noticias/admin");
      if (!res.ok) throw new Error("Error al cargar noticias");
      const data = await res.json();
      setNoticias(data);
    } catch (error) {
      toast.error("No se pudieron cargar las noticias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Estas seguro de eliminar esta noticia?")) return;

    try {
      const res = await fetch(`/api/noticias/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      
      toast.success("Noticia eliminada");
      setNoticias((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      toast.error("Error al eliminar la noticia");
    }
  };

  const handleToggleDestacado = async (noticia: Noticia) => {
    // Optimistic update
    const originalNoticias = [...noticias];
    setNoticias((prev) =>
      prev.map((n) =>
        n.id === noticia.id ? { ...n, destacado: !n.destacado } : n
      )
    );

    try {
      const res = await fetch(`/api/noticias/${noticia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destacado: !noticia.destacado }),
      });

      if (!res.ok) throw new Error("Error al actualizar");
      
      toast.success("Estado actualizado");
    } catch (error) {
      setNoticias(originalNoticias);
      toast.error("No se pudo actualizar el estado");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-sky-500 rounded-full"></div>
            <h1 className="text-2xl font-bold text-white">
              Gestionar Noticias
            </h1>
          </div>
          <p className="text-sm text-slate-400 ml-4">
            Administr� todas las publicaciones del portal.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/20 transition-all hover:bg-sky-500 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Noticia
        </Link>
      </header>

      {noticias.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700 border-dashed">
          <p className="text-slate-400">No hay noticias publicadas a�n.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {noticias.map((noticia) => (
            <article 
              key={noticia.id} 
              className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-sky-900/10"
            >
              {/* Imagen */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
                {noticia.imagenUrl ? (
                  <Image
                    src={noticia.imagenUrl}
                    alt={noticia.titulo}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-600">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm border border-slate-700">
                    {noticia.categoria}
                  </span>
                  {noticia.destacado && (
                    <span className="rounded-full bg-sky-500/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm shadow-lg shadow-sky-500/20">
                      Destacada
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 text-lg font-bold text-white line-clamp-2 group-hover:text-sky-400 transition-colors">
                  {noticia.titulo}
                </h3>
                <p className="mb-4 text-sm text-slate-400 line-clamp-3 flex-1">
                  {noticia.resumen}
                </p>
                
                <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="text-xs text-slate-500">
                    {new Date(noticia.createdAt).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleDestacado(noticia)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-sky-900/40 hover:text-sky-300 transition-colors"
                      title={noticia.destacado ? "Quitar destacado" : "Destacar"}
                    >
                      <svg className="w-4 h-4" fill={noticia.destacado ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(noticia.id)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-red-950/30 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
