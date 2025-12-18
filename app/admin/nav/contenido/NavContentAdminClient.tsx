"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { NavItem, NavSectionConfig } from "@/services/navigation/navigation.types";

type Content = {
  path: string;
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
};

type Props = {
  navItems: NavItem[];
  currentPath: string;
  currentItem: NavItem | null;
  sections: NavSectionConfig[];
};

export default function NavContentAdminClient({ navItems, currentPath, currentItem, sections }: Props) {
  const [path, setPath] = useState(currentPath);
  const [content, setContent] = useState<Content>({ path: currentPath, title: currentItem?.label ?? "", subtitle: "", body: "", imageUrl: "" });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const options = useMemo(
    () => navItems.map((i) => ({
      value: i.href,
      label: `${sections.find((s) => s.section === i.section)?.label ?? i.section.toUpperCase()} · ${i.label}`,
    })),
    [navItems, sections],
  );

  useEffect(() => {
    if (!path) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/nav/page?path=${encodeURIComponent(path)}`);
        if (res.ok) {
          const data = await res.json();
          setContent({
            path,
            title: data.title,
            subtitle: data.subtitle,
            body: data.body,
            imageUrl: data.imageUrl,
          });
        } else {
          setContent((prev) => ({ ...prev, path }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [path]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data?.error ?? "No se pudo subir la imagen");
      setContent((prev) => ({ ...prev, imageUrl: data.url }));
      toast.success("Imagen subida");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.path) {
      toast.error("Elegí primero un ítem del menú");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/nav/page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo guardar");
      }
      toast.success("Contenido guardado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">Navegación</p>
          <h1 className="text-2xl font-bold text-white">Contenido de páginas del menú</h1>
          <p className="text-sm text-slate-400">Selecciona un ítem del menú y edita su página (título, texto, imagen).</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-4 bg-white text-slate-900 rounded-xl p-6 shadow-sm">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Ítem del menú</label>
          <select
            value={path}
            onChange={(e) => {
              setPath(e.target.value);
              setContent((prev) => ({ ...prev, path: e.target.value }));
            }}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">Elegí un ítem</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {loading && <p className="text-xs text-slate-500">Cargando contenido...</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Título</label>
            <input
              value={content.title}
              onChange={(e) => setContent((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Título de la página"
              required
            />

            <label className="block text-sm font-medium">Subtítulo</label>
            <input
              value={content.subtitle ?? ""}
              onChange={(e) => setContent((prev) => ({ ...prev, subtitle: e.target.value }))}
              className="w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Subtítulo opcional"
            />

            <label className="block text-sm font-medium">Texto</label>
            <textarea
              value={content.body ?? ""}
              onChange={(e) => setContent((prev) => ({ ...prev, body: e.target.value }))}
              rows={8}
              className="w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Contenido de la página"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Imagen principal</label>
            <label className="block rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 cursor-pointer hover:border-sky-300 transition-colors">
              <div className="flex items-center justify-center h-14 rounded-md bg-white border border-slate-200 text-slate-500 text-sm">
                {uploading ? "Subiendo..." : "Click para elegir imagen"}
              </div>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              {content.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  <img src={content.imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar contenido"}
          </button>
        </div>
      </form>
    </div>
  );
}
