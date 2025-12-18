"use client";

import Image from "next/image";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { NavPageBlock } from "@/services/navigation/navPage.types";

import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface Props {
  blocks?: NavPageBlock[];
  editable?: boolean;
  onReorder?: (activeId: string, overId: string) => void;
  onUpdateBlock?: (id: string, updates: Partial<NavPageBlock>) => void;
  onUpload?: (file: File) => Promise<string | null>;
  renderBlockControls?: (block: NavPageBlock) => React.ReactNode;
}

const resolveBlockWidth = (block: NavPageBlock): "full" | "half" => {
  if (block.type === "hero") return "full";
  if (block.type === "spacer") return block.width ?? "half";
  return block.width ?? (block.type === "cta" || block.type === "carousel" ? "full" : "half");
};

const isAllowedImage = (url?: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname === "res.cloudinary.com";
  } catch (e) {
    return false;
  }
};

const SortableBlock: React.FC<{
  id: string;
  spanClass: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
}> = ({ id, spanClass, children, controls }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${spanClass} relative rounded-xl ${isDragging ? "z-20" : ""}`}
    >
      <div className="absolute right-2 top-2 z-10 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          aria-label="Arrastrar bloque"
          className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm cursor-grab"
          {...attributes}
          {...listeners}
        >
          ⇅
        </button>
      </div>
      <div className={`group ${isDragging ? "ring-1 ring-sky-200" : ""}`}>
        {children}
        {controls && <div className="mt-3 space-y-2 rounded-lg border border-dashed border-slate-200 bg-white/70 p-3 text-sm">{controls}</div>}
      </div>
    </div>
  );
};

export function PageBlocksRenderer({ blocks, editable, onReorder, onUpdateBlock, onUpload, renderBlockControls }: Props) {
  if (!blocks || blocks.length === 0) return null;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    if (!editable || !onReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  const renderBlock = (block: NavPageBlock, spanClass: string) => {
    if (block.type === "hero") {
      const heroImageUrl = isAllowedImage(block.imageUrl) ? block.imageUrl : undefined;
      
      if (editable && onUpdateBlock) {
        return (
          <section
            key={block.id}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 text-white md:col-span-2 group/hero"
          >
            {heroImageUrl && (
              <div className="absolute inset-0 opacity-30">
                <Image src={heroImageUrl} alt={block.title} fill className="object-cover" />
              </div>
            )}
            {onUpload && (
              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/hero:opacity-100 transition-opacity">
                <label className="cursor-pointer rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow hover:bg-white flex items-center gap-2">
                  <span>📷 Cambiar fondo</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await onUpload(file);
                        if (url) onUpdateBlock(block.id, { imageUrl: url });
                      }
                    }} 
                  />
                </label>
              </div>
            )}
            <div className="relative p-10 md:p-14 space-y-4 max-w-4xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/80">Destacado</p>
              <input
                value={block.title}
                onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                className="w-full bg-transparent text-3xl md:text-4xl font-bold drop-shadow-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-1 -ml-1"
                placeholder="Título del Hero"
              />
              <textarea
                value={block.subtitle ?? ""}
                onChange={(e) => onUpdateBlock(block.id, { subtitle: e.target.value })}
                className="w-full bg-transparent text-lg text-white/85 max-w-3xl resize-none focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-1 -ml-1"
                placeholder="Subtítulo (opcional)"
                rows={2}
              />
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  value={block.ctaLabel ?? ""}
                  onChange={(e) => onUpdateBlock(block.id, { ctaLabel: e.target.value })}
                  className="bg-white/10 px-3 py-1.5 text-white placeholder-white/50 rounded-full border border-white/20 focus:outline-none focus:bg-white/20 text-sm font-semibold w-32"
                  placeholder="Texto Botón"
                />
                <input
                  value={block.ctaHref ?? ""}
                  onChange={(e) => onUpdateBlock(block.id, { ctaHref: e.target.value })}
                  className="bg-white/10 px-3 py-1.5 text-white placeholder-white/50 rounded-full border border-white/20 focus:outline-none focus:bg-white/20 text-sm w-48"
                  placeholder="Enlace (ej: /contacto)"
                />
              </div>
            </div>
          </section>
        );
      }

      return (
        <section
          key={block.id}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 text-white md:col-span-2"
        >
          {heroImageUrl && (
            <div className="absolute inset-0 opacity-30">
              <Image src={heroImageUrl} alt={block.title} fill className="object-cover" />
            </div>
          )}
          <div className="relative p-10 md:p-14 space-y-4 max-w-4xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">Destacado</p>
            <h2 className="text-3xl md:text-4xl font-bold drop-shadow-sm">{block.title}</h2>
            {block.subtitle && <p className="text-lg text-white/85 max-w-3xl">{block.subtitle}</p>}
            {block.ctaLabel && block.ctaHref && (
              <a
                href={block.ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sky-800 font-semibold shadow hover:translate-y-[1px] transition"
              >
                {block.ctaLabel}
              </a>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "richText") {
      if (editable && onUpdateBlock) {
        return (
          <section key={block.id} className={`prose prose-slate max-w-none ${spanClass} relative group/text`}>
             <RichTextEditor
                value={block.html}
                onChange={(html) => onUpdateBlock(block.id, { html })}
             />
          </section>
        );
      }

      const html = block.html?.includes("<")
        ? block.html
        : block.html
            ?.split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => `<p>${line}</p>`)
            .join("") || "";
      if (!html) return null;
      return (
        <section key={block.id} className={`prose prose-slate max-w-none ${spanClass}`}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </section>
      );
    }

    if (block.type === "gallery") {
      const cols = Math.min(Math.max(block.columns ?? 3, 2), 4);
      const colClass = cols === 4 ? "md:grid-cols-4" : cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
      
      if (editable && onUpdateBlock) {
         return (
            <section key={block.id} className={`space-y-3 ${spanClass} group/gallery relative rounded-xl border border-dashed border-slate-200 p-4 hover:border-sky-300 transition-colors`}>
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">Galería</h3>
                  <select 
                     value={block.columns ?? 3}
                     onChange={(e) => onUpdateBlock(block.id, { columns: Number(e.target.value) })}
                     className="text-xs border-slate-200 rounded py-1"
                  >
                     <option value={2}>2 Cols</option>
                     <option value={3}>3 Cols</option>
                     <option value={4}>4 Cols</option>
                  </select>
               </div>
               
               <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${colClass} auto-rows-[minmax(140px,auto)] grid-flow-dense`}>
                  {block.images.map((img, idx) => (
                     <div key={idx} className={`relative overflow-hidden rounded-xl bg-slate-100 group/img ${img.size === "lg" ? "sm:col-span-2 sm:row-span-2 h-64" : img.size === "md" ? "sm:col-span-2 h-52" : "h-44"}`}>
                        {img.url ? (
                           <Image src={img.url} alt={img.caption || ""} fill className="object-cover" />
                        ) : (
                           <div className="flex items-center justify-center h-full text-xs text-slate-400">Sin imagen</div>
                        )}
                        
                        <div className="absolute top-1 right-1 opacity-0 group-hover/img:opacity-100 transition-opacity flex gap-1 z-10">
                           <button 
                              type="button"
                              onClick={() => {
                                 const newImages = [...block.images];
                                 newImages.splice(idx, 1);
                                 onUpdateBlock(block.id, { images: newImages });
                              }}
                              className="bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600"
                           >
                              ×
                           </button>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover/img:opacity-100 transition-opacity space-y-1">
                           <input 
                              value={img.caption ?? ""}
                              onChange={(e) => {
                                 const newImages = [...block.images];
                                 newImages[idx] = { ...newImages[idx], caption: e.target.value };
                                 onUpdateBlock(block.id, { images: newImages });
                              }}
                              className="w-full bg-transparent text-white text-xs border-none focus:ring-0 placeholder-white/50 p-0"
                              placeholder="Leyenda..."
                           />
                           <select
                              value={img.size ?? "md"}
                              onChange={(e) => {
                                 const newImages = [...block.images];
                                 newImages[idx] = { ...newImages[idx], size: e.target.value as any };
                                 onUpdateBlock(block.id, { images: newImages });
                              }}
                              className="w-full bg-white/10 text-white text-[10px] border-none rounded py-0.5 px-1"
                           >
                              <option value="sm" className="text-black">Chica</option>
                              <option value="md" className="text-black">Mediana</option>
                              <option value="lg" className="text-black">Grande</option>
                           </select>
                        </div>
                     </div>
                  ))}
                  
                  {onUpload && (
                     <label className="flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                        <span className="text-2xl text-slate-400">+</span>
                        <span className="text-xs text-slate-500 font-medium">Agregar</span>
                        <input 
                           type="file" 
                           className="hidden" 
                           accept="image/*" 
                           onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 const url = await onUpload(file);
                                 if (url) {
                                    onUpdateBlock(block.id, { 
                                       images: [...block.images, { url, size: "sm" }] 
                                    });
                                 }
                              }
                           }} 
                        />
                     </label>
                  )}
               </div>
            </section>
         );
      }

      const images = block.images.filter((img) => isAllowedImage(img.url));
      return (
        <section key={block.id} className={`space-y-3 ${spanClass}`}>
          <h3 className="text-xl font-semibold text-slate-900">Galería</h3>
          <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${colClass} auto-rows-[minmax(140px,auto)] grid-flow-dense`}>
            {images.map((img, idx) => (
              <div
                key={img.url + idx}
                className={`relative overflow-hidden rounded-xl bg-slate-100 ${img.size === "lg" ? "sm:col-span-2 sm:row-span-2 h-64" : img.size === "md" ? "sm:col-span-2 h-52" : "h-44"}`}
              >
                <Image src={img.url} alt={img.caption || "Imagen de galería"} fill className="object-cover" />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2 text-xs text-white">{img.caption}</div>
                )}
              </div>
            ))}
            {images.length === 0 && <p className="text-sm text-slate-500">Añadí imágenes válidas (Cloudinary).</p>}
          </div>
        </section>
      );
    }

    if (block.type === "carousel") {
      if (editable && onUpdateBlock) {
         return (
            <section key={block.id} className={`space-y-3 ${spanClass || ""} group/carousel relative rounded-xl border border-dashed border-slate-200 p-4 hover:border-sky-300 transition-colors`}>
               <h3 className="text-xl font-semibold text-slate-900">Carrusel</h3>
               <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {block.images.map((img, idx) => (
                     <div key={idx} className="relative h-44 w-72 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 snap-center group/img">
                        {img.url ? (
                           <Image src={img.url} alt={img.caption || ""} fill className="object-cover" />
                        ) : (
                           <div className="flex items-center justify-center h-full text-xs text-slate-400">Sin imagen</div>
                        )}
                        
                        <div className="absolute top-1 right-1 opacity-0 group-hover/img:opacity-100 transition-opacity z-10">
                           <button 
                              type="button"
                              onClick={() => {
                                 const newImages = [...block.images];
                                 newImages.splice(idx, 1);
                                 onUpdateBlock(block.id, { images: newImages });
                              }}
                              className="bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600"
                           >
                              ×
                           </button>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                           <input 
                              value={img.caption ?? ""}
                              onChange={(e) => {
                                 const newImages = [...block.images];
                                 newImages[idx] = { ...newImages[idx], caption: e.target.value };
                                 onUpdateBlock(block.id, { images: newImages });
                              }}
                              className="w-full bg-transparent text-white text-xs border-none focus:ring-0 placeholder-white/50 p-0"
                              placeholder="Leyenda..."
                           />
                        </div>
                     </div>
                  ))}
                  
                  {onUpload && (
                     <label className="flex flex-col items-center justify-center h-44 w-32 flex-shrink-0 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                        <span className="text-2xl text-slate-400">+</span>
                        <span className="text-xs text-slate-500 font-medium">Agregar</span>
                        <input 
                           type="file" 
                           className="hidden" 
                           accept="image/*" 
                           onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 const url = await onUpload(file);
                                 if (url) {
                                    onUpdateBlock(block.id, { 
                                       images: [...block.images, { url }] 
                                    });
                                 }
                              }
                           }} 
                        />
                     </label>
                  )}
               </div>
            </section>
         );
      }

      const images = block.images.filter((img) => isAllowedImage(img.url));
      return (
        <section key={block.id} className={`space-y-3 ${spanClass || ""}`}>
          <h3 className="text-xl font-semibold text-slate-900">Carrusel</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {images.map((img, idx) => (
              <div
                key={img.url + idx}
                className="relative h-44 w-72 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 snap-center"
              >
                <Image src={img.url} alt={img.caption || "Imagen de carrusel"} fill className="object-cover" />
              </div>
            ))}
          </div>
          {images.length === 0 && <p className="text-xs text-slate-500">Añadí imágenes válidas (Cloudinary).</p>}
          <p className="text-xs text-slate-500">Arrastrá para ver el carrusel.</p>
        </section>
      );
    }

    if (block.type === "cta") {
      const ctaImageUrl = isAllowedImage(block.imageUrl) ? block.imageUrl : undefined;
      
      if (editable && onUpdateBlock) {
        return (
          <section
            key={block.id}
            className={`rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-6 flex flex-col md:flex-row gap-4 items-center ${spanClass || ""} group/cta relative`}
          >
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-slate-200 group-hover/cta:ring-2 ring-sky-500/50 transition-all">
              {ctaImageUrl ? (
                <Image src={ctaImageUrl} alt={block.title} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">Sin imagen</div>
              )}
              {onUpload && (
                 <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/cta:opacity-100 cursor-pointer transition-opacity text-white text-xs font-semibold">
                    Cambiar
                    <input 
                       type="file" 
                       className="hidden" 
                       accept="image/*" 
                       onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                             const url = await onUpload(file);
                             if (url) onUpdateBlock(block.id, { imageUrl: url });
                          }
                       }} 
                    />
                 </label>
              )}
            </div>
            <div className="flex-1 space-y-1 w-full">
              <input
                value={block.title}
                onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                className="w-full bg-transparent text-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 rounded px-1 -ml-1"
                placeholder="Título CTA"
              />
              <textarea
                value={block.description ?? ""}
                onChange={(e) => onUpdateBlock(block.id, { description: e.target.value })}
                className="w-full bg-transparent text-sm text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 rounded px-1 -ml-1"
                placeholder="Descripción"
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-2 items-end">
               <input
                  value={block.label ?? ""}
                  onChange={(e) => onUpdateBlock(block.id, { label: e.target.value })}
                  className="rounded-full bg-sky-600 px-4 py-2 text-white font-semibold shadow hover:bg-sky-700 text-center w-32 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                  placeholder="Texto Botón"
               />
               <input
                  value={block.href ?? ""}
                  onChange={(e) => onUpdateBlock(block.id, { href: e.target.value })}
                  className="text-xs text-slate-400 text-right bg-transparent focus:outline-none focus:text-slate-600"
                  placeholder="Enlace (ej: /registro)"
               />
            </div>
          </section>
        );
      }

      return (
        <section
          key={block.id}
          className={`rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-6 flex flex-col md:flex-row gap-4 items-center ${spanClass || ""}`}
        >
          {ctaImageUrl && (
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-slate-200">
              <Image src={ctaImageUrl} alt={block.title} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <h3 className="text-xl font-semibold text-slate-900">{block.title}</h3>
            {block.description && <p className="text-sm text-slate-600">{block.description}</p>}
          </div>
          {block.href && block.label && (
            <a
              href={block.href}
              className="rounded-full bg-sky-600 px-4 py-2 text-white font-semibold shadow hover:bg-sky-700"
            >
              {block.label}
            </a>
          )}
        </section>
      );
    }

    if (block.type === "spacer") {
      if (editable) {
        return (
          <div key={block.id} className={`min-h-[100px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center ${spanClass}`}>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Espacio vacío</span>
          </div>
        );
      }
      return <div key={block.id} className={`hidden md:block ${spanClass}`} />;
    }

    return null;
  };

  const content = (
    <div className="grid gap-10 md:grid-cols-2">
      {blocks.map((block) => {
        const width = resolveBlockWidth(block);
        const spanClass = width === "full" ? "md:col-span-2" : "";
        const rendered = renderBlock(block, spanClass);
        const controls = renderBlockControls?.(block);
        if (!rendered) return null;
        if (!editable || !onReorder) return rendered;
        return (
          <SortableBlock key={block.id} id={block.id} spanClass={spanClass} controls={controls}>
            {rendered}
          </SortableBlock>
        );
      })}
    </div>
  );

  if (!editable || !onReorder) {
    return content;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={rectSortingStrategy}>
        {content}
      </SortableContext>
    </DndContext>
  );
}
