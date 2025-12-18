import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { torneosServerRepository } from "@/services/torneos/torneos.server.repository";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const torneos = await torneosServerRepository.listarTorneosDestacados(50);
  return torneos.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(
  props: PageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const torneo = await torneosServerRepository.obtenerPorSlug(slug);

  if (!torneo) {
    return {
      title: "Torneo no encontrado · Deportes San Isidro",
    };
  }

  return {
    title: `${torneo.titulo} · Deportes San Isidro`,
    description: torneo.descripcionCorta,
  };
}

export default async function TorneoDetallePage(props: PageProps) {
  const { slug } = await props.params;
  const torneo = await torneosServerRepository.obtenerPorSlug(slug);

  if (!torneo) {
    notFound();
  }

  const fechaInicio = new Date(torneo.fechaInicio);
  const fechaFin = torneo.fechaFin ? new Date(torneo.fechaFin) : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
        Torneo · {torneo.disciplina}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {torneo.titulo}
      </h1>
      <p className="mt-2 text-xs text-slate-500">
        {fechaInicio.toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
        {fechaFin &&
          ` al ${fechaFin.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}`}
        {" · "}
        {torneo.sedeNombre}
      </p>

      <p className="mt-4 text-sm text-slate-700">
        {torneo.descripcionCorta}
      </p>

      {torneo.descripcionLarga && (
        <div className="prose prose-sm mt-6 max-w-none prose-slate">
          {/* Podés almacenar aquí un HTML más extenso con el detalle del torneo */}
          <p>{torneo.descripcionLarga}</p>
        </div>
      )}

      {torneo.reglamentoUrl && (
        <p className="mt-6 text-sm">
          <a
            href={torneo.reglamentoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-700 underline-offset-2 hover:underline"
          >
            Ver reglamento completo
          </a>
        </p>
      )}
    </article>
  );
}


