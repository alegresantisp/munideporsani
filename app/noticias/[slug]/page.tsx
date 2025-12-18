import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { noticiasServerRepository } from "@/services/noticias/noticias.server.repository";
import { sanitizeHtml } from "@/lib/security/sanitizeHtml";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 120;

export async function generateStaticParams() {
  const noticias = await noticiasServerRepository.listarNoticiasRecientes(50);
  return noticias.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata(
  props: PageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const noticia = await noticiasServerRepository.obtenerNoticiaPorSlug(slug);

  if (!noticia) {
    return {
      title: "Noticia no encontrada · Deportes San Isidro",
    };
  }

  return {
    title: `${noticia.titulo} · Deportes San Isidro`,
    description: noticia.resumen,
  };
}

export default async function NoticiaDetallePage(props: PageProps) {
  const { slug } = await props.params;
  const noticia = await noticiasServerRepository.obtenerNoticiaPorSlug(slug);

  if (!noticia) {
    notFound();
  }

  const cuerpoSeguro = sanitizeHtml(noticia.cuerpo);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
        {noticia.categoria} · Secretaría de Deportes
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {noticia.titulo}
      </h1>
      <p className="mt-2 text-xs text-slate-500">
        Publicada el{" "}
        {new Date(noticia.fechaPublicacion).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </p>
      <div
        className="prose prose-sm mt-6 max-w-none prose-slate"
        // El HTML se sanitiza en el servidor antes de renderizar para evitar XSS.
        dangerouslySetInnerHTML={{ __html: cuerpoSeguro }}
      />
    </article>
  );
}


