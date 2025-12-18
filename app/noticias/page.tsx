import Link from "next/link";
import { noticiasServerRepository } from "@/services/noticias/noticias.server.repository";

export const revalidate = 60;

export default async function NoticiasPage() {
  const noticias = await noticiasServerRepository.listarNoticiasRecientes(12);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Noticias deportivas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Novedades de la Secretaría de Deportes
        </h1>
        <p className="text-sm text-slate-600">
          Información actualizada sobre actividades, torneos y programas
          deportivos del Municipio de San Isidro.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {noticias.map((noticia) => (
          <article
            key={noticia.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-800 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
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
          </article>
        ))}
        {!noticias.length && (
          <p className="text-sm text-slate-600">
            Aún no hay noticias cargadas. Próximamente vas a encontrar todas las
            novedades deportivas aquí.
          </p>
        )}
      </div>
    </div>
  );
}


