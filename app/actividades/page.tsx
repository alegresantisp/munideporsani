import { actividadesServerRepository } from "@/services/actividades/actividades.server.repository";

export const revalidate = 120;

export default async function ActividadesPage() {
  const actividades = await actividadesServerRepository.listarActividadesActivas();

  const bySede = actividades.reduce<Record<string, typeof actividades>>(
    (acc, act) => {
      const key = act.sedeNombre || "Otras sedes";
      if (!acc[key]) acc[key] = [];
      acc[key]!.push(act);
      return acc;
    },
    {},
  );

  const sedesOrdenadas = Object.keys(bySede).sort((a, b) =>
    a.localeCompare(b, "es"),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Actividades deportivas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Escuelas deportivas y entrenamientos
        </h1>
        <p className="text-sm text-slate-600">
          Conocé la oferta de actividades deportivas del Municipio de San
          Isidro, organizadas por sede y disciplina.
        </p>
      </header>

      {!actividades.length && (
        <p className="text-sm text-slate-600">
          Aún no hay actividades publicadas. Próximamente vas a encontrar aquí
          la oferta completa de la Secretaría de Deportes.
        </p>
      )}

      <div className="space-y-6">
        {sedesOrdenadas.map((sede) => (
          <section
            key={sede}
            className="rounded-2xl border border-slate-100 bg-white p-4"
          >
            <h2 className="text-sm font-semibold text-slate-900">{sede}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {bySede[sede]!.map((act) => (
                <article
                  key={act.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-800"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                    {act.disciplina} · {act.nivel}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {act.titulo}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {act.descripcionCorta}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {act.horarios
                      .map(
                        (h) =>
                          `${h.dia} ${h.horaInicio}–${h.horaFin}`,
                      )
                      .join(" · ")}
                  </p>
                  {typeof act.cupo === "number" && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Cupo aproximado: {act.cupo} personas
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}


