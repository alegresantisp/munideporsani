import Link from "next/link";
import { ReactNode } from "react";

type AccesoRapido = {
  id: string;
  titulo: string;
  descripcion: string;
  href: string;
  icon?: ReactNode;
};

const ACCESOS_RAPIDOS: AccesoRapido[] = [
  {
    id: "turnos-online",
    titulo: "Inscripción a actividades",
    descripcion:
      "Anotate en escuelas deportivas, talleres y entrenamientos municipales.",
    href: "/tramites/inscripciones",
  },
  {
    id: "polideportivos",
    titulo: "Polideportivos y clubes",
    descripcion:
      "Encontrá sedes, horarios y disciplinas disponibles cerca tuyo.",
    href: "/sedes",
  },
  {
    id: "torneos",
    titulo: "Torneos y competencias",
    descripcion:
      "Calendario de torneos municipales, ligas barriales y eventos especiales.",
    href: "/torneos",
  },
  {
    id: "programas",
    titulo: "Programas especiales",
    descripcion:
      "Deporte adaptado, adultos mayores, escuelas de iniciación y más.",
    href: "/programas",
  },
];

export const AccesosRapidos: React.FC = () => {
  return (
    <section
      id="tramites"
      className="bg-slate-50"
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Accesos rápidos
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Ingresá directamente a los servicios más consultados por los vecinos.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ACCESOS_RAPIDOS.map((acceso) => (
            <Link
              key={acceso.id}
              href={acceso.href}
              className="flex h-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                {acceso.titulo}
              </span>
              <span className="text-xs text-slate-600">
                {acceso.descripcion}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};


