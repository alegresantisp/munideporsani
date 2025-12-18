import Link from "next/link";
import { torneosServerRepository } from "@/services/torneos/torneos.server.repository";

export const revalidate = 120;

export default async function TorneosPage() {
  const torneos = await torneosServerRepository.listarTorneos();

  const hoy = new Date();
  const futuros = torneos.filter(
    (t) => new Date(t.fechaFin ?? t.fechaInicio) >= hoy,
  );
  const pasados = torneos.filter(
    (t) => new Date(t.fechaFin ?? t.fechaInicio) < hoy,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Torneos y competencias
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Calendario de torneos deportivos
        </h1>
        <p className="text-sm text-slate-600">
          Consultá los torneos, ligas y competencias organizadas por la
          Secretaría de Deportes del Municipio de San Isidro.
        </p>
      </header>

      {!torneos.length && (
        <p className="text-sm text-slate-600">
          Aún no hay torneos cargados. Próximamente vas a encontrar aquí el
          calendario completo.
        </p>
      )}

      {futuros.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Próximos torneos
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {futuros.map((t) => (
              <article
                key={t.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-800 shadow-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  {t.disciplina}
                </p>
                <Link
                  href={`/torneos/${t.slug}`}
                  className="mt-1 block text-sm font-semibold text-slate-900 hover:text-sky-700"
                >
                  {t.titulo}
                </Link>
                <p className="mt-1 text-xs text-slate-600">
                  {t.descripcionCorta}
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  {new Date(t.fechaInicio).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  {t.fechaFin &&
                    ` al ${new Date(t.fechaFin).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}`}
                  {" · "}
                  {t.sedeNombre}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {pasados.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Torneos finalizados
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {pasados.map((t) => (
              <article
                key={t.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-800"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  {t.disciplina}
                </p>
                <Link
                  href={`/torneos/${t.slug}`}
                  className="mt-1 block text-xs font-semibold text-slate-900 hover:text-sky-700"
                >
                  {t.titulo}
                </Link>
                <p className="mt-1 text-[11px] text-slate-600">
                  {new Date(t.fechaInicio).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  {t.fechaFin &&
                    ` al ${new Date(t.fechaFin).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}`}
                  {" · "}
                  {t.sedeNombre}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


