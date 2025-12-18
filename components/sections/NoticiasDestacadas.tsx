"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Noticia } from "@/services/noticias/noticias.types";
import { registerScrollFadeUp } from "@/lib/gsap/gsapClient";

type NoticiasDestacadasProps = {
  noticias: Noticia[];
};

export const NoticiasDestacadas: React.FC<NoticiasDestacadasProps> = ({
  noticias,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    // ScrollTrigger: las tarjetas aparecen con fade-up al entrar en viewport.
    registerScrollFadeUp("[data-noticia-card]");
  }, []);
  if (!noticias?.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="noticias"
      className="border-y border-slate-100 bg-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Noticias destacadas
            </h2>
            <p className="text-sm text-slate-600">
              Actualidad e información relevante del Municipio.
            </p>
          </div>
          <Link
            href="/noticias"
            className="text-sm font-semibold text-sky-700 underline-offset-2 hover:underline"
          >
            Ver todas
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {noticias.map((noticia) => (
            <article
              key={noticia.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-4 transition hover:-translate-y-0.5 hover:border-sky-100 hover:bg-white hover:shadow-sm"
              data-noticia-card
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                {noticia.categoria}
              </p>
              <Link
                href={`/noticias/${noticia.slug}`}
                className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-sky-700"
              >
                {noticia.titulo}
              </Link>
              <p className="line-clamp-3 text-xs text-slate-600">
                {noticia.resumen}
              </p>
              <p className="mt-auto text-[11px] text-slate-500">
                Publicada el{" "}
                {new Date(noticia.fechaPublicacion).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};


