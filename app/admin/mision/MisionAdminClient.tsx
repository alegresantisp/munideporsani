"use client";

import { useState } from "react";
import type { MissionContent } from "@/services/mission/mission.types";
import { toast } from "sonner";

export default function MisionAdminClient({ initialContent }: { initialContent: MissionContent }) {
  const [content, setContent] = useState<MissionContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      toast.success("Imagen actualizada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/mission", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo guardar");
      }
      toast.success("Misión actualizada");
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
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">Identidad</p>
          <h1 className="text-2xl font-bold text-white">Nuestra Misión</h1>
          <p className="text-sm text-slate-400">Edita título, texto, firma y la imagen lateral.</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-4 bg-white text-slate-900 rounded-xl p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Título</label>
            <input
              value={content.title}
              onChange={(e) => setContent((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full border border-slate-300 rounded px-3 py-2"
              required
            />

            <label className="block text-sm font-medium">Texto</label>
            <textarea
              value={content.body}
              onChange={(e) => setContent((prev) => ({ ...prev, body: e.target.value }))}
              rows={8}
              className="w-full border border-slate-300 rounded px-3 py-2"
              required
            />

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Autor</label>
                <input
                  value={content.author ?? ""}
                  onChange={(e) => setContent((prev) => ({ ...prev, author: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Rol</label>
                <input
                  value={content.role ?? ""}
                  onChange={(e) => setContent((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                  placeholder="Presidente, etc"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Organización</label>
                <input
                  value={content.organization ?? ""}
                  onChange={(e) => setContent((prev) => ({ ...prev, organization: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                  placeholder="Agencia, club, etc"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Imagen lateral</label>
            <label className="block rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 cursor-pointer hover:border-sky-300 transition-colors">
              <div className="flex items-center justify-center h-14 rounded-md bg-white border border-slate-200 text-slate-500 text-sm">
                {uploading ? "Subiendo..." : "Click aquí para elegir una imagen"}
              </div>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              {content.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  <img
                    src={content.imageUrl}
                    alt="Misión"
                    className="w-full h-64 object-cover"
                  />
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
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
