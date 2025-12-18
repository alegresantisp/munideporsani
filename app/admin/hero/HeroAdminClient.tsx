"use client";

import { useState } from "react";
import type { HeroSlide } from "@/services/hero/hero.types";
import Image from "next/image";

export default function HeroAdminClient({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSlide({ active: true, order: slides.length });
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

    const isNew = !editingSlide.id;
    const url = isNew ? "/api/hero" : `/api/hero/${editingSlide.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingSlide),
    });

    if (res.ok) {
      const saved = await res.json(); // If POST returns {id}
      // Refresh list (simple way)
      const listRes = await fetch("/api/hero");
      const newSlides = await listRes.json();
      setSlides(newSlides);
      setIsModalOpen(false);
      setEditingSlide(null);
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
        <h1 className="text-2xl font-bold">Gestión del Hero (Carrusel)</h1>
        <button
          onClick={handleCreate}
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
        >
          Nuevo Slide
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      {isModalOpen && editingSlide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSlide.id ? "Editar Slide" : "Nuevo Slide"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Imagen</label>
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
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={editingSlide.title || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subtítulo</label>
                <textarea
                  value={editingSlide.subtitle || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Texto Botón</label>
                  <input
                    type="text"
                    value={editingSlide.buttonText || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, buttonText: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Link Botón</label>
                  <input
                    type="text"
                    value={editingSlide.buttonLink || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, buttonLink: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Orden</label>
                  <input
                    type="number"
                    value={editingSlide.order || 0}
                    onChange={(e) => setEditingSlide({ ...editingSlide, order: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
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
                    <span className="text-sm font-medium">Activo</span>
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
