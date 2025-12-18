"use client";

import { useState } from "react";
import type { HeroSlide, HeroConfig } from "@/services/hero/hero.types";
import Image from "next/image";
import { toast } from "sonner";

type Props = {
  initialSlides: HeroSlide[];
  initialConfig: HeroConfig;
};

export default function HeroAdminClient({ initialSlides, initialConfig }: Props) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState<HeroConfig>(initialConfig);
  const maxSlides = 3;

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    if (slides.length >= maxSlides) {
      toast.error("Solo puedes tener hasta 3 slides en el hero.");
      return;
    }
    setEditingSlide({ active: true, order: slides.length + 1 });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este slide?")) return;
    await fetch(`/api/hero/${id}`, { method: "DELETE" });
    setSlides(slides.filter((s) => s.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (!editingSlide.title || !editingSlide.imageUrl) {
      toast.error("La imagen y el título son obligatorios");
      return;
    }

    const order = Number(editingSlide.order ?? 0);
    const payload = { ...editingSlide, order };

    const isNew = !editingSlide.id;
    const url = isNew ? "/api/hero" : `/api/hero/${editingSlide.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo guardar el slide");
      }

      const listRes = await fetch("/api/hero");
      const newSlides = await listRes.json();
      setSlides(newSlides);
      setIsModalOpen(false);
      setEditingSlide(null);
      toast.success("Slide guardado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/hero/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo guardar la frase");
      }
      toast.success("Frase actualizada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la frase");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setEditingSlide((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión del Hero (Carrusel)</h1>
          <p className="text-sm text-slate-500">Máximo {maxSlides} imágenes activas con su texto.</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={slides.length >= maxSlides}
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Nuevo Slide
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {slides.map((slide) => (
          <div key={slide.id} className="border rounded-lg overflow-hidden shadow-sm bg-white">
            <div className="relative h-48 w-full bg-gray-200">
              {slide.imageUrl ? (
                <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Sin imagen</div>
              )}
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Orden: {slide.order}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg truncate">{slide.title}</h3>
              <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(slide)}
                  className="text-sky-600 hover:underline text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSaveConfig} className="space-y-3 bg-white text-slate-900 rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Frase destacada</h2>
        <p className="text-sm text-slate-600">Texto que se muestra debajo del hero principal en la portada.</p>
        <label className="block text-sm font-medium text-slate-900">Frase</label>
        <textarea
          value={config.tagline}
          onChange={(e) => setConfig((prev) => ({ ...prev, tagline: e.target.value }))}
          rows={2}
          className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900"
          required
        />
        <label className="block text-sm font-medium text-slate-900">Subtítulo (opcional)</label>
        <input
          value={config.subline ?? ""}
          onChange={(e) => setConfig((prev) => ({ ...prev, subline: e.target.value }))}
          className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900"
          placeholder="Energía, pasión y oportunidades para todos."
        />
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
          >
            Guardar frase
          </button>
        </div>
      </form>

      {isModalOpen && editingSlide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingSlide.id ? "Editar Slide" : "Nuevo Slide"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-900">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
                {uploading && <p className="text-xs text-sky-600 mt-1">Subiendo...</p>}
                {editingSlide.imageUrl && (
                  <div className="mt-2 relative h-32 w-full rounded overflow-hidden">
                    <Image src={editingSlide.imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-900">Título</label>
                <input
                  type="text"
                  value={editingSlide.title || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-900">Subtítulo</label>
                <textarea
                  value={editingSlide.subtitle || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 placeholder-slate-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-900">Texto Botón</label>
                  <input
                    type="text"
                    value={editingSlide.buttonText || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, buttonText: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-900">Link Botón</label>
                  <input
                    type="text"
                    value={editingSlide.buttonLink || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, buttonLink: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-900">Orden</label>
                  <input
                    type="number"
                    value={editingSlide.order || 0}
                    onChange={(e) => setEditingSlide({ ...editingSlide, order: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSlide.active ?? true}
                      onChange={(e) => setEditingSlide({ ...editingSlide, active: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm font-medium text-slate-900">Activo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
