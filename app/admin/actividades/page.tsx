"use client";

import { useEffect, useState } from "react";
import type {
  DiaSemana,
  NivelActividad,
  TipoActividad,
  HorarioActividad,
  Actividad,
} from "@/services/actividades/actividades.types";
import { toast } from "sonner";

const NIVELES: NivelActividad[] = ["Inicial", "Intermedio", "Avanzado", "Mixto"];
const TIPOS: TipoActividad[] = ["Escuela", "Entrenamiento", "Recreativa", "Competitiva"];
const DIAS: DiaSemana[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

type FormState = {
  titulo: string;
  descripcionCorta: string;
  disciplina: string;
  tipo: TipoActividad;
  nivel: NivelActividad;
  sedeId: string;
  sedeNombre: string;
  cupo: string;
  edadMin: string;
  edadMax: string;
  horarios: HorarioActividad[];
  activa: boolean;
};

export default function AdminActividadesPage() {
  const [form, setForm] = useState<FormState>({
    titulo: "",
    descripcionCorta: "",
    disciplina: "",
    tipo: "Escuela",
    nivel: "Inicial",
    sedeId: "",
    sedeNombre: "",
    cupo: "",
    edadMin: "",
    edadMax: "",
    horarios: [
      { dia: "Lunes", horaInicio: "18:00", horaFin: "19:00" },
      { dia: "Miércoles", horaInicio: "18:00", horaFin: "19:00" },
    ],
    activa: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const fetchActividades = async () => {
    try {
      setLoadingList(true);
      const res = await fetch("/api/actividades/admin");
      if (!res.ok) throw new Error("No se pudieron cargar las actividades");
      const data = (await res.json()) as Actividad[];
      setActividades(data);
    } catch (error) {
      setErrorList(
        error instanceof Error
          ? error.message
          : "Error inesperado al cargar actividades",
      );
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void fetchActividades();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    const isCheckbox = target instanceof HTMLInputElement && target.type === "checkbox";
    const checked = isCheckbox ? target.checked : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  const handleHorarioChange = (
    index: number,
    field: keyof HorarioActividad,
    value: string,
  ) => {
    setForm((prev) => {
      const nextHorarios = [...prev.horarios];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      nextHorarios[index] = {
        ...nextHorarios[index]!,
        [field]: value,
      };
      return { ...prev, horarios: nextHorarios };
    });
  };

  const addHorario = () => {
    setForm((prev) => ({
      ...prev,
      horarios: [
        ...prev.horarios,
        { dia: "Lunes", horaInicio: "18:00", horaFin: "19:00" },
      ],
    }));
  };

  const removeHorario = (index: number) => {
    setForm((prev) => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/actividades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cupo: form.cupo ? Number(form.cupo) : undefined,
          edadMin: form.edadMin ? Number(form.edadMin) : undefined,
          edadMax: form.edadMax ? Number(form.edadMax) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Error al crear la actividad");
      }

      toast.success("Actividad creada correctamente.");
      setForm((prev) => ({
        ...prev,
        titulo: "",
        descripcionCorta: "",
        disciplina: "",
        sedeId: "",
        sedeNombre: "",
        cupo: "",
        edadMin: "",
        edadMax: "",
      }));
      void fetchActividades();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error inesperado al crear la actividad",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
          Actividades
        </p>
        <h1 className="text-lg font-semibold text-slate-50">
          Crear y administrar actividades deportivas
        </h1>
        <p className="text-xs text-slate-400">
          Cargá escuelas deportivas, entrenamientos y actividades recreativas y
          administrá las ya publicadas.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 text-xs text-slate-50"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="titulo"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Título
            </label>
            <input
              id="titulo"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="disciplina"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Disciplina
            </label>
            <input
              id="disciplina"
              name="disciplina"
              value={form.disciplina}
              onChange={handleChange}
              required
              placeholder="Fútbol, Natación, Hockey, etc."
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="descripcionCorta"
            className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
          >
            Descripción corta
          </label>
          <textarea
            id="descripcionCorta"
            name="descripcionCorta"
            value={form.descripcionCorta}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="tipo"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            >
              {TIPOS.map((t) => (
                <option
                  key={t}
                  value={t}
                >
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="nivel"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Nivel
            </label>
            <select
              id="nivel"
              name="nivel"
              value={form.nivel}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            >
              {NIVELES.map((n) => (
                <option
                  key={n}
                  value={n}
                >
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="activa"
              name="activa"
              type="checkbox"
              checked={form.activa}
              onChange={handleChange}
              className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-sky-500"
            />
            <label
              htmlFor="activa"
              className="text-xs text-slate-300"
            >
              Actividad activa (visible en la web)
            </label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="sedeNombre"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Sede / Polideportivo
            </label>
            <input
              id="sedeNombre"
              name="sedeNombre"
              value={form.sedeNombre}
              onChange={handleChange}
              required
              placeholder="Polideportivo Nº 1, Club X, etc."
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="cupo"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Cupo aproximado
            </label>
            <input
              id="cupo"
              name="cupo"
              type="number"
              min={0}
              value={form.cupo}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="edadMin"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Edad mínima
            </label>
            <input
              id="edadMin"
              name="edadMin"
              type="number"
              min={0}
              value={form.edadMin}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="edadMax"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Edad máxima
            </label>
            <input
              id="edadMax"
              name="edadMax"
              type="number"
              min={0}
              value={form.edadMax}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
            Horarios
          </p>
          <div className="space-y-2">
            {form.horarios.map((h, index) => (
              <div
                key={`${h.dia}-${index}`}
                className="flex flex-wrap items-center gap-2"
              >
                <select
                  value={h.dia}
                  onChange={(e) =>
                    handleHorarioChange(index, "dia", e.target.value)
                  }
                  className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
                >
                  {DIAS.map((d) => (
                    <option
                      key={d}
                      value={d}
                    >
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={h.horaInicio}
                  onChange={(e) =>
                    handleHorarioChange(index, "horaInicio", e.target.value)
                  }
                  className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
                />
                <span className="text-xs text-slate-400">a</span>
                <input
                  type="time"
                  value={h.horaFin}
                  onChange={(e) =>
                    handleHorarioChange(index, "horaFin", e.target.value)
                  }
                  className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
                />
                {form.horarios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHorario(index)}
                    className="ml-1 text-[11px] text-red-400 hover:text-red-300"
                  >
                    Quitar
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addHorario}
            className="text-[11px] text-sky-400 hover:text-sky-300"
          >
            + Agregar horario
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-950 shadow-sm transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {isSubmitting ? "Guardando..." : "Guardar actividad"}
        </button>

      </form>

      <section className="space-y-2 text-xs text-slate-50">
        <h2 className="text-sm font-semibold text-slate-50">
          Actividades cargadas
        </h2>
        {loadingList && (
          <p className="text-xs text-slate-300">Cargando actividades...</p>
        )}
        {errorList && <p className="text-xs text-red-400">{errorList}</p>}
        {!loadingList && !actividades.length && (
          <p className="text-xs text-slate-300">
            Todavía no hay actividades cargadas.
          </p>
        )}
        {!loadingList && actividades.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">Disciplina</th>
                  <th className="px-3 py-2 text-left">Título</th>
                  <th className="px-3 py-2 text-left">Sede</th>
                  <th className="px-3 py-2 text-left">Activa</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-slate-800/60 hover:bg-slate-900/60"
                  >
                    <td className="px-3 py-2 text-slate-300">{a.disciplina}</td>
                    <td className="px-3 py-2 text-slate-50">
                      <span className="line-clamp-2">{a.titulo}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {a.sedeNombre}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/actividades/${a.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ activa: !a.activa }),
                            });
                            if (!res.ok) throw new Error();
                            setActividades((prev) =>
                              prev.map((act) =>
                                act.id === a.id
                                  ? { ...act, activa: !a.activa }
                                  : act,
                              ),
                            );
                            toast.success("Actividad actualizada.");
                          } catch {
                            toast.error("No se pudo actualizar la actividad.");
                          }
                        }}
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          a.activa
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {a.activa ? "Activa" : "Inactiva"}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-300">
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !confirm(
                              "¿Seguro que querés eliminar esta actividad?",
                            )
                          ) {
                            return;
                          }
                          try {
                            const res = await fetch(
                              `/api/actividades/${a.id}`,
                              {
                                method: "DELETE",
                              },
                            );
                            if (!res.ok) throw new Error();
                            setActividades((prev) =>
                              prev.filter((act) => act.id !== a.id),
                            );
                            toast.success("Actividad eliminada.");
                          } catch {
                            toast.error("No se pudo eliminar la actividad.");
                          }
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


