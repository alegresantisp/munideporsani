"use client";

import React, { useEffect, useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import type { NavItem, NavSection, NavSectionConfig } from "@/services/navigation/navigation.types";
import type { NavPageBlock } from "@/services/navigation/navPage.types";
import { PageBlocksRenderer } from "@/components/navigation/PageBlocksRenderer";

const MAX_SECTIONS = 7;

const createDefaultBlocks = (params: { title: string; subtitle?: string; imageUrl?: string; body?: string; href?: string }): NavPageBlock[] => {
  const heroBlock: NavPageBlock = {
    id: crypto.randomUUID(),
    type: "hero",
    title: params.title || "Nueva página",
    subtitle: params.subtitle,
    imageUrl: params.imageUrl,
    ctaHref: params.href,
    ctaLabel: params.href ? "Ver más" : undefined,
  };

  const richTextBlock: NavPageBlock = {
    id: crypto.randomUUID(),
    type: "richText",
    html: params.body || "<p>Agrega contenido en el bloque de texto.</p>",
    width: "half",
  };

  return [heroBlock, richTextBlock];
};

type Props = {
  initialItems: Record<NavSection, NavItem[]>;
  initialSections: NavSectionConfig[];
};

type FormState = {
  id?: string;
  section: NavSection;
  label: string;
  href: string;
  order: number;
  active: boolean;
};

type NewSectionState = {
  section: string;
  label: string;
  order: number;
  active: boolean;
};

type PageConfigState = {
  layout: "hero-text" | "hero-gallery" | "simple";
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  path: string;
  blocks: NavPageBlock[];
};

export default function NavAdminClient({ initialItems, initialSections }: Props) {
  const [sections, setSections] = useState<NavSectionConfig[]>(initialSections);
  const [items, setItems] = useState<Record<NavSection, NavItem[]>>(initialItems);
  const [savingSectionId, setSavingSectionId] = useState<NavSection | null>(null);
  const [saving, setSaving] = useState(false);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [pageSaving, setPageSaving] = useState(false);

  const firstSection = sections[0]?.section ?? "";
  const initialList = firstSection ? initialItems[firstSection] ?? [] : [];

  const [form, setForm] = useState<FormState>({
    section: firstSection,
    label: "",
    href: "",
    order: (initialList[initialList.length - 1]?.order ?? 0) + 1,
    active: true,
  });

  const [newSection, setNewSection] = useState<NewSectionState>({
    section: "",
    label: "",
    order: sections.length + 1,
    active: true,
  });

  const [pageConfig, setPageConfig] = useState<PageConfigState>({
    layout: "hero-text",
    title: "",
    subtitle: "",
    body: "",
    imageUrl: "",
    path: form.href || "",
    blocks: createDefaultBlocks({ title: "", subtitle: "", body: "", href: "" }),
  });



  const currentList = useMemo(() => (form.section ? items[form.section] ?? [] : []), [items, form.section]);
  const activeSectionCount = useMemo(() => sections.filter((s) => s.active).length, [sections]);
  const maxReached = activeSectionCount >= MAX_SECTIONS;
  const currentSectionLabel = useMemo(() => {
    const found = sections.find((s) => s.section === form.section)?.label;
    return found ?? (form.section || "Sección");
  }, [sections, form.section]);

  // Mantener la ruta y título del contenido sincronizados mientras se edita el ítem
  useEffect(() => {
    setPageConfig((prev) => ({
      ...prev,
      path: form.href || prev.path,
      title: prev.title || form.label,
    }));
  }, [form.href, form.label]);

  const resetForm = (section?: FormState["section"]) => {
    const targetSection = section ?? form.section;
    const list = items[targetSection] ?? [];
    setForm({
      section: targetSection,
      label: "",
      href: "",
      order: (list[list.length - 1]?.order ?? 0) + 1,
      active: true,
    });
  };

  const refreshSections = async (): Promise<NavSectionConfig[] | null> => {
    const res = await fetch("/api/nav/sections");
    if (res.ok) {
      const data = await res.json();
      const list = data as NavSectionConfig[];
      setSections(list);
      if (list.length > 0 && !list.find((s) => s.section === form.section)) {
        resetForm(list[0].section);
      }
      return list;
    }
    return null;
  };

  const handleSectionSave = async (sectionId: NavSection) => {
    const data = sections.find((s) => s.section === sectionId);
    if (!data) return;
    if (!data.label) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setSavingSectionId(sectionId);
    try {
      const res = await fetch("/api/nav/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: sectionId,
          label: data.label,
          order: Number(data.order ?? 0),
          active: data.active,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error ?? "No se pudo guardar");
      }
      await refreshSections();
      toast.success("Sección actualizada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSavingSectionId(null);
    }
  };

  const handleCreateSection = async () => {
    if (!newSection.section.trim() || !newSection.label.trim()) {
      toast.error("Definí clave y nombre");
      return;
    }
    setSavingSectionId("new");
    try {
      const res = await fetch("/api/nav/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: newSection.section.trim(),
          label: newSection.label.trim(),
          order: Number(newSection.order ?? sections.length + 1),
          active: newSection.active,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error ?? "No se pudo crear la sección");
      }
      const refreshed = await refreshSections();
      setItems((prev) => ({ ...prev, [newSection.section.trim()]: [] }));
      const nextOrder = (refreshed?.length ?? sections.length) + 1;
      setNewSection({ section: "", label: "", order: nextOrder, active: true });
      toast.success("Sección creada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear");
    } finally {
      setSavingSectionId(null);
    }
  };

  const ensurePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

  const uploadAsset = async (file?: File): Promise<string | null> => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data?.error ?? "No se pudo subir la imagen");
    return data.url as string;
  };

  const openPageConfig = async (item?: NavItem) => {
    const basePath = ensurePath(item?.href || form.href || "/");
    if (item) {
      setForm({ ...item });
    }
    // Prefill path immediately for the input
    setPageConfig((prev) => ({ ...prev, path: basePath }));
    setPageSaving(true);
    try {
      const res = await fetch(`/api/nav/page?path=${encodeURIComponent(basePath)}`);
      if (res.ok) {
        const data = await res.json();
        setPageConfig({
          layout: data.layout ?? "hero-text",
          title: data.title ?? item?.label ?? form.label,
          subtitle: data.subtitle ?? "",
          body: data.body ?? "",
          imageUrl: data.imageUrl ?? "",
          path: basePath,
          blocks: (data.blocks as NavPageBlock[] | undefined) ?? createDefaultBlocks({
            title: data.title ?? item?.label ?? form.label,
            subtitle: data.subtitle,
            imageUrl: data.imageUrl,
            body: data.body,
            href: basePath,
          }),
        });
      } else {
        setPageConfig({
          layout: "hero-text",
          title: item?.label || form.label || "",
          subtitle: "",
          body: "",
          imageUrl: "",
          path: basePath,
          blocks: createDefaultBlocks({ title: item?.label || form.label || "", href: basePath }),
        });
      }
      setPageModalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la página");
    } finally {
      setPageSaving(false);
    }
  };



  const addBlock = (type: NavPageBlock["type"]) => {
    const baseTitle = pageConfig.title || form.label || "Nuevo bloque";
    const makeId = () => crypto.randomUUID();

    const newBlock: NavPageBlock = (() => {
      switch (type) {
        case "hero":
          return { id: makeId(), type: "hero", title: baseTitle, subtitle: pageConfig.subtitle, imageUrl: pageConfig.imageUrl };
        case "richText":
          return { id: makeId(), type: "richText", html: "<p>Contenido de texto.</p>", width: "half" };
        case "gallery":
          return { id: makeId(), type: "gallery", title: "", images: [], columns: 3, width: "half" };
        case "carousel":
          return { id: makeId(), type: "carousel", title: "", images: [], animation: "slide", size: "md", width: "full" };
        case "spacer":
          return { id: makeId(), type: "spacer", width: "half" };
        case "cta":
        default:
          return {
            id: makeId(),
            type: "cta",
            title: baseTitle,
            description: "",
            href: form.href || "",
            label: "Ver más",
            width: "full",
          };
      }
    })();

    setPageConfig((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const updateBlock = (id: string, data: Partial<NavPageBlock>) => {
    setPageConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => (block.id === id ? { ...block, ...data } as NavPageBlock : block)),
    }));
  };

  const removeBlock = (id: string) => {
    setPageConfig((prev) => ({ ...prev, blocks: prev.blocks.filter((b) => b.id !== id) }));
  };





  const handlePreviewReorder = (activeId: string, overId: string) => {
    setPageConfig((prev) => {
      const oldIndex = prev.blocks.findIndex((b) => b.id === activeId);
      const newIndex = prev.blocks.findIndex((b) => b.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return { ...prev, blocks: arrayMove(prev.blocks, oldIndex, newIndex) };
    });
  };









  const handleSavePageContent = async () => {
    const path = ensurePath(pageConfig.path || form.href);
    if (!path) return;
    setPageSaving(true);
    try {
      const res = await fetch("/api/nav/page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          title: pageConfig.title || form.label,
          subtitle: pageConfig.subtitle,
          body: pageConfig.body,
          imageUrl: pageConfig.imageUrl,
          layout: pageConfig.layout,
          blocks: pageConfig.blocks,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "No se pudo guardar la página");
      toast.success("Página guardada");
      setPageModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la página");
    } finally {
      setPageSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.section) {
      toast.error("Primero crea o selecciona una sección");
      return;
    }
    setSaving(true);
    try {
      const isNew = !form.id;
      const url = isNew ? `/api/nav/${form.section}` : `/api/nav/${form.section}/${form.id}`;
      const method = isNew ? "POST" : "PATCH";
      const payload = {
        label: form.label,
        href: form.href,
        order: Number(form.order ?? 0),
        active: form.active,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo guardar el ítem");
      }

      const listRes = await fetch(`/api/nav/${form.section}`);
      const updated = await listRes.json();
      setItems((prev) => ({ ...prev, [form.section]: updated }));
      resetForm(form.section);
      toast.success(isNew ? "Ítem creado" : "Ítem actualizado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: NavItem) => {
    setForm({ ...item });
  };

  const handleDelete = async (item: NavItem) => {
    if (!confirm("¿Eliminar este ítem?")) return;
    try {
      const res = await fetch(`/api/nav/${item.section}/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      const listRes = await fetch(`/api/nav/${item.section}`);
      const updated = await listRes.json();
      setItems((prev) => ({ ...prev, [item.section]: updated }));
      if (form.id === item.id) resetForm(item.section as FormState["section"]);
      toast.success("Ítem eliminado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
    }
  };

  return (
    <>
      <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">Navegación</p>
          <h1 className="text-2xl font-bold text-white">Menú desplegable y nombres del navbar</h1>
          <p className="text-sm text-slate-400">Renombra las pestañas principales y carga enlaces para cada sección (se muestran los activos).</p>
        </div>
      </header>

      <section className="rounded-xl bg-white p-5 shadow-sm text-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Secciones del navbar (máx. {MAX_SECTIONS})</h2>
            <p className="text-xs text-slate-500">Clave = identificador interno. Activa/ordena para definir el menú superior.</p>
          </div>
          <span className={`text-xs font-semibold ${maxReached ? "text-red-600" : "text-slate-500"}`}>
            {activeSectionCount}/{MAX_SECTIONS} activas
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div key={section.section} className="rounded-lg border border-slate-200 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wide">{section.section}</span>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={section.active}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((s) => (s.section === section.section ? { ...s, active: e.target.checked } : s)),
                      )
                    }
                    className="rounded text-sky-600"
                  />
                  Activa
                </label>
              </div>
              <input
                value={section.label}
                onChange={(e) =>
                  setSections((prev) => prev.map((s) => (s.section === section.section ? { ...s, label: e.target.value } : s)))
                }
                className="w-full rounded border border-slate-300 px-3 py-2"
                placeholder="Nombre en navbar"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Orden</label>
                <input
                  type="number"
                  value={section.order}
                  onChange={(e) =>
                    setSections((prev) => prev.map((s) => (s.section === section.section ? { ...s, order: Number(e.target.value) } : s)))
                  }
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSectionSave(section.section)}
                className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={savingSectionId === section.section}
              >
                {savingSectionId === section.section ? "Guardando..." : "Guardar"}
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-dashed border-slate-300 p-4 space-y-3 bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Agregar sección</h3>
            {sections.length >= MAX_SECTIONS && <span className="text-xs text-red-600">Máximo de {MAX_SECTIONS}</span>}
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium">Clave (sin espacios)</label>
              <input
                value={newSection.section}
                onChange={(e) => setNewSection((prev) => ({ ...prev, section: e.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2"
                placeholder="ej: turismo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nombre en navbar</label>
              <input
                value={newSection.label}
                onChange={(e) => setNewSection((prev) => ({ ...prev, label: e.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2"
                placeholder="Ej: Turismo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Orden</label>
              <input
                type="number"
                value={newSection.order}
                onChange={(e) => setNewSection((prev) => ({ ...prev, order: Number(e.target.value) }))}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={newSection.active}
                onChange={(e) => setNewSection((prev) => ({ ...prev, active: e.target.checked }))}
                className="rounded text-sky-600"
              />
              <span className="text-sm">Activa</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreateSection}
            disabled={savingSectionId === "new" || sections.length >= MAX_SECTIONS}
            className="rounded bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
          >
            {savingSectionId === "new" ? "Guardando..." : "Crear sección"}
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-xl bg-white p-5 shadow-sm space-y-3 text-slate-900">
          <h2 className="text-lg font-semibold">Ítem del menú</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Sección</label>
              <select
                value={form.section}
                onChange={(e) => {
                  const section = e.target.value as FormState["section"];
                  resetForm(section);
                }}
                className="w-full rounded border border-slate-300 px-3 py-2"
              >
                {sections.map((section) => (
                  <option key={section.section} value={section.section}>{section.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Orden</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Texto</label>
              <input
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2"
                placeholder="Ej: Delegación Martínez"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Ruta / URL</label>
              <input
                value={form.href}
                onChange={(e) => setForm((prev) => ({ ...prev, href: e.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2"
                placeholder="/delegaciones/martinez"
                required
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
              className="rounded text-sky-600"
            />
            Activo (visible en el menú)
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : form.id ? "Actualizar" : "Crear"}
            </button>
            <button
              type="button"
              onClick={() => resetForm()}
              className="rounded px-4 py-2 text-slate-600 border border-slate-300"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm text-slate-900">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Ítems en {currentSectionLabel}</h2>
            <span className="text-xs text-slate-500">{currentList.length} ítems</span>
          </div>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {currentList.length === 0 && (
              <p className="text-sm text-slate-500">No hay ítems cargados.</p>
            )}
            {currentList.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{item.label}</p>
                  <p className="text-xs text-slate-500 truncate">{item.href}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${item.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                    {item.active ? "✓" : "–"}
                    {item.active ? "Activo" : "Oculto"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700"
                    aria-label="Editar"
                  >
                    <span aria-hidden>✏️</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openPageConfig(item)}
                    className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800"
                    aria-label="Configurar página"
                  >
                    <span aria-hidden>⚙️</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                    aria-label="Borrar"
                  >
                    <span aria-hidden>🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>

    {pageModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 py-10 overflow-y-auto">
        <div className="w-full max-w-6xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">Builder</p>
              <h3 className="text-xl font-semibold text-slate-900">Configurar página de este ítem</h3>
            </div>
            <button className="text-slate-500 hover:text-slate-700" onClick={() => setPageModalOpen(false)}>Cerrar</button>
          </div>

          <div className="grid gap-4 grid-cols-1">
            <div className="space-y-4">
              <div className="space-y-2 rounded-xl border border-slate-200 p-4 bg-slate-50/80">
                <label className="block text-sm font-medium">Ruta</label>
                <input
                  value={pageConfig.path}
                  onChange={(e) => setPageConfig((prev) => ({ ...prev, path: e.target.value }))}
                  onBlur={(e) => setPageConfig((prev) => ({ ...prev, path: ensurePath(e.target.value) }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
                  placeholder="/institucional/mi-pagina"
                />
                <p className="text-xs text-slate-500">Usa la misma ruta del ítem (se agrega el / si falta).</p>
              </div>

              {/* Hidden legacy controls removed */}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 p-3 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">Agregar:</span>
                <button
                  type="button"
                  className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-sky-700 transition whitespace-nowrap"
                  onClick={() => addBlock("hero")}
                >
                  + Hero
                </button>
                <button
                  type="button"
                  className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition whitespace-nowrap"
                  onClick={() => addBlock("richText")}
                >
                  + Texto
                </button>
                <button
                  type="button"
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 border border-slate-200 shadow-sm hover:border-sky-300 transition whitespace-nowrap"
                  onClick={() => addBlock("gallery")}
                >
                  + Galería
                </button>
                <button
                  type="button"
                  className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-violet-700 transition whitespace-nowrap"
                  onClick={() => addBlock("carousel")}
                >
                  + Carrusel
                </button>
                <button
                  type="button"
                  className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition whitespace-nowrap"
                  onClick={() => addBlock("cta")}
                >
                  + CTA
                </button>
                <button
                  type="button"
                  className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow hover:bg-slate-300 transition whitespace-nowrap border border-dashed border-slate-400"
                  onClick={() => addBlock("spacer")}
                >
                  + Espacio
                </button>
              </div>

              <div className="p-4 min-h-[500px] bg-slate-100/50">
                {pageConfig.blocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-300 rounded-xl">
                    <p>La página está vacía</p>
                    <p className="text-sm">Agrega bloques usando la barra superior</p>
                  </div>
                ) : (
                  <PageBlocksRenderer
                    blocks={pageConfig.blocks}
                    editable
                    onReorder={handlePreviewReorder}
                    onUpdateBlock={(id, updates) => updateBlock(id, updates as NavPageBlock)}
                    onUpload={async (file) => {
                      setPageSaving(true);
                      try {
                        return await uploadAsset(file);
                      } catch (error) {
                        toast.error("Error al subir imagen");
                        return null;
                      } finally {
                        setPageSaving(false);
                      }
                    }}
                    renderBlockControls={(block) => (
                      <div className="flex items-center justify-between gap-2">
                        {block.type !== "hero" && (
                          <div className="flex items-center gap-1 bg-slate-100 rounded p-1">
                            <button
                              type="button"
                              onClick={() => updateBlock(block.id, { width: "half" } as NavPageBlock)}
                              className={`px-2 py-0.5 text-[10px] font-medium rounded ${(!block.width || block.width === "half") ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                              title="Mitad de ancho"
                            >
                              1/2
                            </button>
                            <button
                              type="button"
                              onClick={() => updateBlock(block.id, { width: "full" } as NavPageBlock)}
                              className={`px-2 py-0.5 text-[10px] font-medium rounded ${block.width === "full" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                              title="Ancho completo"
                            >
                              Full
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 ml-auto"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded border border-slate-300 text-slate-700"
              onClick={() => setPageModalOpen(false)}
              disabled={pageSaving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
              onClick={handleSavePageContent}
              disabled={pageSaving}
            >
              {pageSaving ? "Guardando..." : "Guardar página"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
