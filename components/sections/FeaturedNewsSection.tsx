"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import type { FeaturedCard } from "@/services/featured/featured.server.repository";

export const FeaturedNewsSection = ({ cards }: { cards: FeaturedCard[] }) => {
  const [activeModal, setActiveModal] = useState<FeaturedCard | null>(null);

  if (!cards || cards.length === 0) return null;

  return (
    <section className="border-y border-slate-100 bg-sky-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Noticias Destacadas</h2>
          <div className="h-1 w-14 bg-sky-500" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
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
                        onClick={() => setActiveModal(card)}
                        className="text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                     >
                        {card.buttonText || "Leer más"} →
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)} 
        title={activeModal?.modalTitle || activeModal?.title}
        size="4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-8">
          <div className="space-y-4">
             {activeModal?.imageUrl && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm">
                   <Image unoptimized src={activeModal.imageUrl} alt={activeModal.title} fill className="object-cover" />
                </div>
             )}
             {activeModal?.modalImages && activeModal.modalImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                   {activeModal.modalImages.map((img, idx) => (
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
                dangerouslySetInnerHTML={{ __html: activeModal?.modalContent || "" }} 
                className="prose prose-slate max-w-none text-slate-600 prose-headings:font-serif prose-headings:text-slate-900 prose-a:text-sky-600" 
             />
          </div>
        </div>
      </Modal>
    </section>
  );
};
