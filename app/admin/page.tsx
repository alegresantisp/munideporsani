"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import Image from "next/image";

type FormState = {
  titulo: string;
  cuerpo: string;
  categoria: string;
  resumen: string;
  destacado: boolean;
  imagenFile: File | null;
};

const CATEGORIAS = [
  "Gobierno",
  "Obras Públicas",
  "Cultura",
  "Deportes",
  "Salud",
  "Educación",
] as const;

export default function AdminDashboardPage() {
  const [form, setForm] = useState<FormState>({
    titulo: "",
    cuerpo: "",
    categoria: "Deportes",
    resumen: "",
    destacado: true,
    imagenFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    const isCheckbox = target instanceof HTMLInputElement && target.type === "checkbox";
    setForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? target.checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, imagenFile: file }));
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("titulo", form.titulo);
      formData.set("cuerpo", form.cuerpo);
      formData.set("categoria", form.categoria);
      formData.set("resumen", form.resumen);
      formData.set("destacado", String(form.destacado));
      if (form.imagenFile) {
        formData.set("imagen", form.imagenFile);
      }

      const res = await fetch("/api/noticias", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Error al crear la noticia");
      }

      toast.success("Noticia creada correctamente.");
      setForm({
        titulo: "",
        cuerpo: "",
        categoria: "Deportes",
        resumen: "",
        destacado: true,
        imagenFile: null,
      });
      setPreviewUrl(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error inesperado al crear la noticia",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-sky-500 rounded-full"></div>
          <h1 className="text-2xl font-bold text-white">
            Nueva Noticia
          </h1>
        </div>
        <p className="text-sm text-slate-400 ml-4">
          Publicá novedades, eventos y comunicados oficiales.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sección Principal */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <label htmlFor="titulo" className="text-sm font-medium text-slate-300">
                Título de la noticia
              </label>
              <input
                id="titulo"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                required
                placeholder="Ej: Gran torneo de verano en el Poli 1"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="resumen" className="text-sm font-medium text-slate-300">
                Resumen corto (Copete)
              </label>
              <textarea
                id="resumen"
                name="resumen"
                value={form.resumen}
                onChange={handleChange}
                rows={3}
                placeholder="Breve descripción que aparecerá en las tarjetas..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Sidebar del formulario */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="categoria" className="text-sm font-medium text-slate-300">
                Categoría
              </label>
              <div className="relative">
                <select
                  id="categoria"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.destacado ? 'bg-sky-500 border-sky-500' : 'border-slate-500'}`}>
                  {form.destacado && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  name="destacado"
                  checked={form.destacado}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-sm font-medium text-slate-200">Destacar noticia</span>
              </label>
              <p className="mt-2 text-xs text-slate-400 pl-8">
                Aparecerá en el carrusel principal de noticias.
              </p>
            </div>
          </div>
        </div>

        {/* Editor de Texto */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Contenido de la noticia
          </label>
          <div className="rounded-lg border border-slate-700 overflow-hidden bg-white text-slate-900">
            <RichTextEditor
              id="cuerpo"
              name="cuerpo"
              label=""
              value={form.cuerpo}
              onChange={(html) => setForm((prev) => ({ ...prev, cuerpo: html }))}
            />
          </div>
        </div>

        {/* Carga de Imagen */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Imagen de portada
          </label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-700 px-6 py-10 hover:bg-slate-800/50 transition-colors relative group">
            {previewUrl ? (
              <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden shadow-lg">
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  fill 
                  className="object-cover" 
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, imagenFile: null }));
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-4 flex text-sm text-slate-400 justify-center">
                  <label
                    htmlFor="imagen"
                    className="relative cursor-pointer rounded-md font-medium text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 hover:text-sky-400"
                  >
                    <span>Subir un archivo</span>
                    <input id="imagen" name="imagen" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                  </label>
                  <p className="pl-1">o arrastrar y soltar</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, GIF hasta 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Botón Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/20 transition-all hover:bg-sky-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publicando...
              </>
            ) : (
              "Publicar Noticia"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
             