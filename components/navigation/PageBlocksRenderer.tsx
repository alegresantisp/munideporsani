"use client";

import { useState, useEffect, useCallback } from "react";
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
import type { NavPageBlock, BlockStyles } from "@/services/navigation/navPage.types";

import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Modal } from "@/components/ui/Modal";

const FONT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Impact", value: "Impact, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
];

const SIZE_OPTIONS = [
  { label: "XS", value: "0.75rem" },
  { label: "SM", value: "0.875rem" },
  { label: "MD", value: "1rem" },
  { label: "LG", value: "1.125rem" },
  { label: "XL", value: "1.25rem" },
  { label: "2XL", value: "1.5rem" },
  { label: "3XL", value: "1.875rem" },
];

const getBlockClasses = (styles?: BlockStyles) => {
  const classes = [];
  
  // Padding
  switch (styles?.paddingY) {
    case "none": classes.push("py-0"); break;
    case "sm": classes.push("py-4"); break;
    case "lg": classes.push("py-16"); break;
    case "xl": classes.push("py-24"); break;
    default: classes.push("py-8"); break; // Default md
  }

  // Theme
  switch (styles?.theme) {
    case "dark": classes.push("bg-slate-900 text-white"); break;
    case "blue": classes.push("bg-sky-50 text-slate-900"); break;
    case "gray": classes.push("bg-slate-100 text-slate-900"); break;
    default: classes.push(""); break; // Default transparent/white
  }

  // Text Align
  if (styles?.textAlign) classes.push(`text-${styles.textAlign}`);

  // Animation
  if (styles?.animation === "fade-in") classes.push("animate-in fade-in duration-700");
  if (styles?.animation === "slide-up") classes.push("animate-in slide-in-from-bottom-8 duration-700");

  return classes.join(" ");
};

const BlockSettings = ({ 
  styles, 
  onChange 
}: { 
  styles?: BlockStyles; 
  onChange: (styles: BlockStyles) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-30 inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-sky-600 bg-white/80 px-2 py-1 rounded border border-slate-200 shadow-sm"
      >
        <span>⚙️ Estilos</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-xl z-50">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700">Espaciado Vertical</label>
              <select 
                value={styles?.paddingY ?? "md"}
                onChange={(e) => onChange({ ...styles, paddingY: e.target.value as any })}
                className="mt-1 block w-full rounded border-slate-200 text-xs text-slate-900"
              >
                <option value="none">Ninguno</option>
                <option value="sm">Pequeño</option>
                <option value="md">Medio</option>
                <option value="lg">Grande</option>
                <option value="xl">Extra Grande</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Tema (Fondo)</label>
              <select 
                value={styles?.theme ?? "light"}
                onChange={(e) => onChange({ ...styles, theme: e.target.value as any })}
                className="mt-1 block w-full rounded border-slate-200 text-xs text-slate-900"
              >
                <option value="light">Claro (Default)</option>
                <option value="gray">Gris</option>
                <option value="blue">Azul Claro</option>
                <option value="dark">Oscuro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Alineación</label>
              <div className="mt-1 flex gap-1">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    onClick={() => onChange({ ...styles, textAlign: align as any })}
                    className={`flex-1 rounded border px-2 py-1 text-xs ${
                      (styles?.textAlign ?? "left") === align 
                        ? "bg-sky-100 border-sky-300 text-sky-700" 
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {align === "left" ? "Izq" : align === "center" ? "Cen" : "Der"}
                  </button>
                ))}
              </div>
            </div>
             <div>
              <label className="block text-xs font-medium text-slate-700">Animación</label>
              <select 
                value={styles?.animation ?? "none"}
                onChange={(e) => onChange({ ...styles, animation: e.target.value as any })}
                className="mt-1 block w-full rounded border-slate-200 text-xs text-slate-900"
              >
                <option value="none">Ninguna</option>
                <option value="fade-in">Aparecer (Fade)</option>
                <option value="slide-up">Deslizar arriba</option>
              </select>
            </div>
          </div>
          <div className="mt-3 border-t pt-2 text-right">
             <button onClick={() => setIsOpen(false)} className="text-xs text-sky-600 hover:underline">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

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
  if (url.startsWith("blob:")) return true;
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

const Carousel = ({
  images,
  animation = "slide",
  size = "md",
  autoplay = false,
  interval = 3000,
}: {
  images: { url: string; caption?: string }[];
  animation?: "slide" | "fade" | "coverflow";
  size?: "sm" | "md" | "lg" | "xl";
  autoplay?: boolean;
  interval?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!autoplay || images.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, next, images.length]);

  if (images.length === 0) return null;

  const heightClass = size === "xl" ? "h-[500px]" : size === "lg" ? "h-96" : size === "sm" ? "h-48" : "h-72";

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-slate-100 ${heightClass} group`}>
      <div className="relative h-full w-full">
        {images.map((img, idx) => {
          const isActive = idx === currentIndex;
          
          if (animation === "fade") {
             return (
               <div
                 key={idx}
                 className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                   isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                 }`}
               >
                 <Image unoptimized src={img.url} alt={img.caption || ""} fill className="object-cover" />
                 {img.caption && (
                   <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white backdrop-blur-sm">
                     <p className="text-sm font-medium">{img.caption}</p>
                   </div>
                 )}
               </div>
             );
          }
          
          return (
            <div
              key={idx}
              className="absolute inset-0 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${(idx - currentIndex) * 100}%)` }}
            >
               <Image unoptimized src={img.url} alt={img.caption || ""} fill className="object-cover" />
               {img.caption && (
                 <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white backdrop-blur-sm">
                   <p className="text-sm font-medium">{img.caption}</p>
                 </div>
               )}
            </div>
          );
        })}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export function PageBlocksRenderer({ blocks, editable, onReorder, onUpdateBlock, onUpload, renderBlockControls }: Props) {
  const [activeModal, setActiveModal] = useState<{ 
    title: string; 
    content: string; 
    mainImage?: string; 
    images?: string[]; 
  } | null>(null);

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
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 text-white md:col-span-2 group/hero ${getBlockClasses(block.styles)}`}
          >
            <div className="absolute top-4 left-4 z-20 opacity-0 group-hover/hero:opacity-100 transition-opacity">
               <BlockSettings styles={block.styles} onChange={(styles) => onUpdateBlock(block.id, { styles })} />
            </div>
            {heroImageUrl && (
              <div className="absolute inset-0 opacity-30">
                <Image unoptimized src={heroImageUrl} alt={block.title} fill className="object-cover" />
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
            <div className={`relative p-10 md:p-14 space-y-4 max-w-4xl ${block.styles?.textAlign === 'center' ? 'mx-auto' : block.styles?.textAlign === 'right' ? 'ml-auto' : ''}`}>
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
              <div className={`flex flex-wrap gap-2 items-center ${block.styles?.textAlign === 'center' ? 'justify-center' : block.styles?.textAlign === 'right' ? 'justify-end' : ''}`}>
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
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 text-white md:col-span-2 ${getBlockClasses(block.styles)}`}
        >
          {heroImageUrl && (
            <div className="absolute inset-0 opacity-30">
              <Image unoptimized src={heroImageUrl} alt={block.title} fill className="object-cover" />
            </div>
          )}
          <div className={`relative p-10 md:p-14 space-y-4 max-w-4xl ${block.styles?.textAlign === 'center' ? 'mx-auto' : block.styles?.textAlign === 'right' ? 'ml-auto' : ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold drop-shadow-sm">{block.title}</h2>
            {block.subtitle && <p className="text-lg text-white/85 max-w-3xl">{block.subtitle}</p>}
            {block.ctaLabel && block.ctaHref && (
              <div className={`flex ${block.styles?.textAlign === 'center' ? 'justify-center' : block.styles?.textAlign === 'right' ? 'justify-end' : ''}`}>
                <a
                  href={block.ctaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sky-800 font-semibold shadow hover:translate-y-[1px] transition"
                >
                  {block.ctaLabel}
                </a>
              </div>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "richText") {
      if (editable && onUpdateBlock) {
        return (
          <section key={block.id} className={`prose prose-slate max-w-none ${spanClass} relative group/text ${getBlockClasses(block.styles)}`}>
             <div className="absolute -top-8 left-0 z-20 opacity-0 group-hover/text:opacity-100 transition-opacity">
                <BlockSettings styles={block.styles} onChange={(styles) => onUpdateBlock(block.id, { styles })} />
             </div>
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
        <section key={block.id} className={`prose prose-slate max-w-none ${spanClass} ${getBlockClasses(block.styles)}`}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </section>
      );
    }

     if (block.type === "gallery") {
      const cols = Math.min(Math.max(block.columns ?? 3, 1), 4);
      const colClass = cols === 4 ? "md:grid-cols-4" : cols === 2 ? "md:grid-cols-2" : cols === 1 ? "md:grid-cols-1" : "md:grid-cols-3";
      
      if (editable && onUpdateBlock) {
         return (
            <section key={block.id} className={`space-y-3 ${spanClass} group/gallery relative rounded-xl border border-dashed border-slate-200 p-4 hover:border-sky-300 transition-colors ${getBlockClasses(block.styles)}`}>
            <div className="absolute -top-3 left-0 z-20 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
               <BlockSettings styles={block.styles} onChange={(styles) => onUpdateBlock(block.id, { styles })} />
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <input
                value={block.title ?? ""}
                onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                placeholder="Título opcional (deja vacío para ocultar)"
                className="w-full md:w-1/2 rounded border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
                  <select 
                     value={block.columns ?? 3}
                     onChange={(e) => onUpdateBlock(block.id, { columns: Number(e.target.value) })}
                     className="text-xs border-slate-200 rounded py-1 text-slate-900"
                  >
                     <option value={1}>1 Col</option>
                     <option value={2}>2 Cols</option>
                     <option value={3}>3 Cols</option>
                     <option value={4}>4 Cols</option>
                  </select>
               </div>
               
               <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${colClass} auto-rows-[minmax(140px,auto)] grid-flow-dense`}>
                  {block.images.map((img, idx) => (
                     <div key={idx} className={`relative overflow-hidden rounded-xl bg-slate-100 group/img ${img.size === "xl" ? "sm:col-span-2 sm:row-span-2 h-96" : img.size === "lg" ? "sm:col-span-2 sm:row-span-2 h-64" : img.size === "md" ? "sm:col-span-2 h-52" : "h-44"}`}>
                        {img.url ? (
                           <Image unoptimized src={img.url} alt={img.caption || ""} fill className="object-cover" />
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
                              <option value="xl" className="text-black">Extra Grande</option>
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
        <section key={block.id} className={`space-y-3 ${spanClass} ${getBlockClasses(block.styles)}`}>
          {block.title ? <h3 className="text-xl font-semibold text-slate-900">{block.title}</h3> : null}
          <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${colClass} auto-rows-[minmax(140px,auto)] grid-flow-dense`}>
            {images.map((img, idx) => (
              <div
                key={img.url + idx}
                className={`relative overflow-hidden rounded-xl bg-slate-100 ${img.size === "xl" ? "sm:col-span-2 sm:row-span-2 h-96" : img.size === "lg" ? "sm:col-span-2 sm:row-span-2 h-64" : img.size === "md" ? "sm:col-span-2 h-52" : "h-44"}`}
              >
                <Image unoptimized src={img.url} alt={img.caption || "Imagen de galería"} fill className="object-cover" />
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
          <section key={block.id} className={`space-y-3 ${spanClass || ""} group/carousel relative rounded-xl border border-dashed border-slate-200 p-4 hover:border-sky-300 transition-colors ${getBlockClasses(block.styles)}`}>
            <div className="absolute -top-3 left-0 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
               <BlockSettings styles={block.styles} onChange={(styles) => onUpdateBlock(block.id, { styles })} />
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <input
                value={block.title ?? ""}
                onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                placeholder="Título opcional (deja vacío para ocultar)"
                className="rounded border border-slate-200 px-3 py-2 text-sm text-slate-900 md:col-span-2"
              />
              <div className="flex gap-2 flex-wrap">
                <select
                  value={block.animation ?? "slide"}
                  onChange={(e) => onUpdateBlock(block.id, { animation: e.target.value as any })}
                  className="flex-1 rounded border border-slate-200 px-2 py-2 text-sm text-slate-900"
                >
                  <option value="slide">Slide</option>
                  <option value="fade">Fade</option>
                </select>
                <select
                  value={block.size ?? "md"}
                  onChange={(e) => onUpdateBlock(block.id, { size: e.target.value as any })}
                  className="w-24 rounded border border-slate-200 px-2 py-2 text-sm text-slate-900"
                >
                  <option value="sm">Chico</option>
                  <option value="md">Medio</option>
                  <option value="lg">Grande</option>                  <option value="xl">Extra Grande</option>                  <option value="xl">Extra Grande</option>
                </select>
                <label className="flex items-center gap-1 rounded border border-slate-200 px-2 py-2 text-xs text-slate-900 bg-white cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={block.autoplay ?? false} 
                      onChange={(e) => onUpdateBlock(block.id, { autoplay: e.target.checked })}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    Auto
                 </label>
                 {block.autoplay && (
                   <input
                     type="number"
                     value={block.interval ?? 3000}
                     onChange={(e) => onUpdateBlock(block.id, { interval: parseInt(e.target.value) || 3000 })}
                     className="w-16 rounded border border-slate-200 px-2 py-2 text-xs text-slate-900"
                     step={500}
                     min={1000}
                     placeholder="ms"
                   />
                 )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {block.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 group/img"
                >
                  {img.url ? (
                    <Image unoptimized src={img.url} alt={img.caption || ""} fill className="object-cover" />
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
                <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
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
                            images: [...block.images, { url }],
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
        <section key={block.id} className={`space-y-3 ${spanClass || ""} ${getBlockClasses(block.styles)}`}>
          {block.title ? <h3 className="text-xl font-semibold text-slate-900">{block.title}</h3> : null}
          <Carousel 
            images={images} 
            animation={block.animation} 
            size={block.size} 
            autoplay={block.autoplay} 
            interval={block.interval} 
          />
        </section>
      );
    }

    if (block.type === "cards_grid") {
      const cols = block.columns ?? 3;
      const gridClass = cols === 4 ? "md:grid-cols-4" : cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

      if (editable && onUpdateBlock) {
         return (
            <section key={block.id} className={`space-y-4 ${spanClass} relative rounded-xl border border-dashed border-slate-200 p-4 hover:border-orange-300 transition-colors ${getBlockClasses(block.styles)}`}>
               <div className="absolute -top-3 left-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BlockSettings styles={block.styles} onChange={(styles) => onUpdateBlock(block.id, { styles })} />
               </div>
               <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <input 
                     value={block.title ?? ""}
                     onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                     placeholder="Título de la sección (opcional)"
                     className="w-full md:w-1/2 rounded border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                  <select
                     value={block.columns ?? 3}
                     onChange={(e) => onUpdateBlock(block.id, { columns: Number(e.target.value) })}
                     className="w-24 rounded border border-slate-200 px-2 py-2 text-sm text-slate-900"
                  >
                     <option value={2}>2 Cols</option>
                     <option value={3}>3 Cols</option>
                     <option value={4}>4 Cols</option>
                  </select>
               </div>

               <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${gridClass}`}>
                  {block.cards.map((card, idx) => (
                     <div key={card.id} className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 group/card">
                        <button 
                           onClick={() => {
                              const newCards = [...block.cards];
                              newCards.splice(idx, 1);
                              onUpdateBlock(block.id, { cards: newCards });
                           }}
                           className="absolute top-2 right-2 text-red-500 hover:text-red-700 z-10"
                        >
                           ×
                        </button>
                        
                        <div className="relative h-32 w-full rounded-lg bg-slate-100 overflow-hidden group/cardimg">
                           {card.imageUrl ? (
                              <Image unoptimized src={card.imageUrl} alt="" fill className="object-cover" />
                           ) : (
                              <div className="flex items-center justify-center h-full text-xs text-slate-400">Sin imagen</div>
                           )}
                           {onUpload && (
                              <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/cardimg:opacity-100 cursor-pointer transition-opacity text-white text-xs font-semibold">
                                 Cambiar
                                 <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={async (e) => {
                                       const file = e.target.files?.[0];
                                       if (file) {
                                          const url = await onUpload(file);
                                          if (url) {
                                             const newCards = [...block.cards];
                                             newCards[idx] = { ...card, imageUrl: url };
                                             onUpdateBlock(block.id, { cards: newCards });
                                          }
                                       }
                                    }} 
                                 />
                              </label>
                           )}
                        </div>

                        <div className="space-y-1">
                           <div className="flex gap-1">
                              <input 
                                 value={card.title}
                                 onChange={(e) => {
                                    const newCards = [...block.cards];
                                    newCards[idx] = { ...card, title: e.target.value };
                                    onUpdateBlock(block.id, { cards: newCards });
                                 }}
                                 style={{ fontFamily: card.titleFont, fontSize: card.titleSize }}
                                 className="flex-1 font-semibold text-slate-900 border border-transparent hover:border-slate-200 rounded px-1 py-0.5 text-sm"
                                 placeholder="Título Tarjeta"
                              />
                              <div className="flex flex-col gap-0.5">
                                 <select
                                    value={card.titleFont ?? ""}
                                    onChange={(e) => {
                                       const newCards = [...block.cards];
                                       newCards[idx] = { ...card, titleFont: e.target.value };
                                       onUpdateBlock(block.id, { cards: newCards });
                                    }}
                                    className="w-20 text-[10px] border-slate-200 rounded py-0 px-1 h-5 text-slate-900"
                                    title="Fuente Título"
                                 >
                                    <option value="">Fuente</option>
                                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                 </select>
                                 <select
                                    value={card.titleSize ?? ""}
                                    onChange={(e) => {
                                       const newCards = [...block.cards];
                                       newCards[idx] = { ...card, titleSize: e.target.value };
                                       onUpdateBlock(block.id, { cards: newCards });
                                    }}
                                    className="w-20 text-[10px] border-slate-200 rounded py-0 px-1 h-5 text-slate-900"
                                    title="Tamaño Título"
                                 >
                                    <option value="">Tamaño</option>
                                    {SIZE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                 </select>
                              </div>
                           </div>
                           
                           <div className="flex gap-1 items-start">
                              <textarea 
                                 value={card.description ?? ""}
                                 onChange={(e) => {
                                    const newCards = [...block.cards];
                                    newCards[idx] = { ...card, description: e.target.value };
                                    onUpdateBlock(block.id, { cards: newCards });
                                 }}
                                 style={{ fontFamily: card.descFont, fontSize: card.descSize }}
                                 className="flex-1 text-xs text-slate-600 border border-transparent hover:border-slate-200 rounded px-1 py-0.5 resize-none"
                                 rows={2}
                                 placeholder="Descripción breve..."
                              />
                              <div className="flex flex-col gap-0.5">
                                 <select
                                    value={card.descFont ?? ""}
                                    onChange={(e) => {
                                       const newCards = [...block.cards];
                                       newCards[idx] = { ...card, descFont: e.target.value };
                                       onUpdateBlock(block.id, { cards: newCards });
                                    }}
                                    className="w-20 text-[10px] border-slate-200 rounded py-0 px-1 h-5 text-slate-900"
                                    title="Fuente Descripción"
                                 >
                                    <option value="">Fuente</option>
                                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                 </select>
                                 <select
                                    value={card.descSize ?? ""}
                                    onChange={(e) => {
                                       const newCards = [...block.cards];
                                       newCards[idx] = { ...card, descSize: e.target.value };
                                       onUpdateBlock(block.id, { cards: newCards });
                                    }}
                                    className="w-20 text-[10px] border-slate-200 rounded py-0 px-1 h-5 text-slate-900"
                                    title="Tamaño Descripción"
                                 >
                                    <option value="">Tamaño</option>
                                    {SIZE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                 </select>
                              </div>
                           </div>
                        </div>

                        <input 
                           value={card.buttonText ?? "Leer más"}
                           onChange={(e) => {
                              const newCards = [...block.cards];
                              newCards[idx] = { ...card, buttonText: e.target.value };
                              onUpdateBlock(block.id, { cards: newCards });
                           }}
                           className="w-full text-xs text-sky-600 font-medium border border-transparent hover:border-slate-200 rounded px-1 py-0.5"
                           placeholder="Texto Botón"
                        />

                        <label className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-2 cursor-pointer bg-slate-50 p-1 rounded border border-slate-100">
                           <input 
                              type="checkbox" 
                              checked={card.featured ?? false}
                              onChange={(e) => {
                                 const newCards = [...block.cards];
                                 newCards[idx] = { ...card, featured: e.target.checked };
                                 onUpdateBlock(block.id, { cards: newCards });
                              }}
                              className="rounded text-sky-600 focus:ring-sky-500"
                           />
                           Destacar en Landing Page
                        </label>
                        
                        <div className="pt-2 border-t border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contenido Modal</p>
                           <input 
                              value={card.modalTitle ?? ""}
                              onChange={(e) => {
                                 const newCards = [...block.cards];
                                 newCards[idx] = { ...card, modalTitle: e.target.value };
                                 onUpdateBlock(block.id, { cards: newCards });
                              }}
                              className="w-full text-xs font-semibold text-slate-900 border border-slate-200 rounded px-2 py-1 mb-2"
                              placeholder="Título Modal"
                           />
                           <div className="h-32 overflow-y-auto border border-slate-200 rounded bg-white">
                              <RichTextEditor 
                                 value={card.modalContent ?? ""} 
                                 onChange={(html) => {
                                    const newCards = [...block.cards];
                                    newCards[idx] = { ...card, modalContent: html };
                                    onUpdateBlock(block.id, { cards: newCards });
                                 }} 
                              />
                           </div>
                           <div className="mt-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Imágenes Extra Modal</p>
                              <div className="flex flex-wrap gap-2">
                                 {card.modalImages?.map((img, imgIdx) => (
                                    <div key={imgIdx} className="relative w-12 h-12 rounded overflow-hidden group/modalimg">
                                       <Image unoptimized src={img} alt="" fill className="object-cover" />
                                       <button
                                          onClick={() => {
                                             const newCards = [...block.cards];
                                             const newImages = [...(card.modalImages || [])];
                                             newImages.splice(imgIdx, 1);
                                             newCards[idx] = { ...card, modalImages: newImages };
                                             onUpdateBlock(block.id, { cards: newCards });
                                          }}
                                          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover/modalimg:opacity-100 flex items-center justify-center text-xs"
                                       >
                                          ×
                                       </button>
                                    </div>
                                 ))}
                                 {onUpload && (
                                    <label className="w-12 h-12 flex items-center justify-center border border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-slate-600">
                                       <span className="text-lg">+</span>
                                       <input 
                                          type="file" 
                                          className="hidden" 
                                          accept="image/*" 
                                          onChange={async (e) => {
                                             const file = e.target.files?.[0];
                                             if (file) {
                                                const url = await onUpload(file);
                                                if (url) {
                                                   const newCards = [...block.cards];
                                                   const newImages = [...(card.modalImages || []), url];
                                                   newCards[idx] = { ...card, modalImages: newImages };
                                                   onUpdateBlock(block.id, { cards: newCards });
                                                }
                                             }
                                          }} 
                                       />
                                    </label>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
                  
                  <button 
                     onClick={() => {
                        const newCards = [...block.cards, { 
                           id: crypto.randomUUID(), 
                           title: "Nueva Tarjeta", 
                           description: "", 
                           buttonText: "Leer más",
                           modalTitle: "Detalle",
                           modalContent: "<p>Info...</p>"
                        }];
                        onUpdateBlock(block.id, { cards: newCards });
                     }}
                     className="flex flex-col items-center justify-center min-h-[300px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                  >
                     <span className="text-2xl">+</span>
                     <span className="text-xs font-medium">Agregar Tarjeta</span>
                  </button>
               </div>
            </section>
         );
      }

      return (
         <section key={block.id} className={`space-y-6 ${spanClass} ${getBlockClasses(block.styles)}`}>
            {block.title && <h3 className="text-2xl font-bold text-slate-900">{block.title}</h3>}
            <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 ${gridClass}`}>
               {block.cards.map((card) => (
                  <div key={card.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md border border-slate-100">
                     {card.imageUrl && (
                        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                           <Image unoptimized src={card.imageUrl} alt={card.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                     )}
                     <div className="flex flex-1 flex-col p-5">
                        <h4 className="text-lg font-bold text-slate-900" style={{ fontFamily: card.titleFont, fontSize: card.titleSize }}>{card.title}</h4>
                        {card.description && <p className="mt-2 text-sm text-slate-600 line-clamp-3" style={{ fontFamily: card.descFont, fontSize: card.descSize }}>{card.description}</p>}
                        <div className="mt-auto pt-4">
                           <button 
                              onClick={() => setActiveModal({ 
                                title: card.modalTitle || card.title, 
                                content: card.modalContent || "",
                                mainImage: card.imageUrl,
                                images: card.modalImages
                              })}
                              className="text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                           >
                              {card.buttonText || "Leer más"} →
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>
      );
    }

    if (block.type === "cta") {
      const ctaImageUrl = isAllowedImage(block.imageUrl) ? block.imageUrl : undefined;
      
      if (editable && onUpdateBlock) {
        return (
          <section
            key={block.id}
            className={`rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-6 flex flex-col md:flex-row gap-4 items-center ${spanClass || ""} group/cta relative ${getBlockClasses(block.styles)}`}
          >
            <div className="absolute -top-3 left-0 z-20 opacity-0 group-hover/cta:opacity-100 transition-opacity">
               <BlockSettings styles={block.styles} onChange={(styles) => onUpdateBlock(block.id, { styles })} />
            </div>
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-slate-200 group-hover/cta:ring-2 ring-sky-500/50 transition-all">
              {ctaImageUrl ? (
                <Image unoptimized src={ctaImageUrl} alt={block.title} fill className="object-cover" />
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
            <div className={`flex flex-col gap-2 ${block.styles?.textAlign === 'center' ? 'items-center' : block.styles?.textAlign === 'right' ? 'items-end' : 'items-start'}`}>
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
          className={`rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-6 flex flex-col md:flex-row gap-4 items-center ${spanClass || ""} ${getBlockClasses(block.styles)}`}
        >
          {ctaImageUrl && (
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-slate-200">
              <Image unoptimized src={ctaImageUrl} alt={block.title} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <h3 className="text-xl font-semibold text-slate-900">{block.title}</h3>
            {block.description && <p className="text-sm text-slate-600">{block.description}</p>}
          </div>
          {block.href && block.label && (
            <div className={`${block.styles?.textAlign === 'center' ? 'self-center' : block.styles?.textAlign === 'right' ? 'self-end' : 'self-start'}`}>
              <a
                href={block.href}
                className="rounded-full bg-sky-600 px-4 py-2 text-white font-semibold shadow hover:bg-sky-700"
              >
                {block.label}
              </a>
            </div>
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

  const mainContent = (!editable || !onReorder) ? content : (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={rectSortingStrategy}>
        {content}
      </SortableContext>
    </DndContext>
  );

  return (
    <>
      {mainContent}
      <Modal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)} 
        title={activeModal?.title}
        size="4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-8">
          <div className="space-y-4">
             {activeModal?.mainImage && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm">
                   <Image unoptimized src={activeModal.mainImage} alt={activeModal.title} fill className="object-cover" />
                </div>
             )}
             {activeModal?.images && activeModal.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                   {activeModal.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity">
                         <Image unoptimized src={img} alt="" fill className="object-cover" />
                      </div>
                   ))}
                </div>
             )}
          </div>
          <div className="space-y-4">
             <h2 className="text-3xl font-bold text-slate-900 font-serif leading-tight">{activeModal?.title}</h2>
             <div className="h-1 w-20 bg-sky-500 rounded-full" />
             <div 
                dangerouslySetInnerHTML={{ __html: activeModal?.content || "" }} 
                className="prose prose-slate max-w-none text-slate-600 prose-headings:font-serif prose-headings:text-slate-900 prose-a:text-sky-600" 
             />
          </div>
        </div>
      </Modal>
    </>
  );
}
