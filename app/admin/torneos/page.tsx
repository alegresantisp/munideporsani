"use client";

import { useEffect, useState } from "react";
import type {
  CategoriaTorneo,
  EstadoTorneo,
  Torneo,
} from "@/services/torneos/torneos.types";
import { toast } from "sonner";

const ESTADOS: EstadoTorneo[] = [
  "Inscripción abierta",
  "Inscripción cerrada",
  "En curso",
  "Finalizado",
];

const CATEGORIAS: CategoriaTorneo[] = [
  "Infantil",
  "Juvenil",
  "Adultos",
  "Mayores",
  "Mixto",
];

type FormState = {
  titulo: string;
  descripcionCorta: string;
  descripcionLarga: string;
  disciplina: string;
  sedeNombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoTorneo;
  categoriasSeleccionadas: CategoriaTorneo[];
  reglamentoUrl: string;
  destacado: boolean;
};

export default function AdminTorneosPage() {
  const [form, setForm] = useState<FormState>({
    titulo: "",
    descripcionCorta: "",
    descripcionLarga: "",
    disciplina: "",
    sedeNombre: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "Inscripción abierta",
    categoriasSeleccionadas: ["Infantil"],
    reglamentoUrl: "",
    destacado: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const fetchTorneos = async () => {
    try {
      setLoadingList(true);
      const res = await fetch("/api/torneos/admin");
      if (!res.ok) throw new Error("No se pudieron cargar los torneos");
      const data = (await res.json()) as Torneo[];
      setTorneos(data);
    } catch (error) {
      setErrorList(
        error instanceof Error
          ? error.message
          : "Error inesperado al cargar torneos",
      );
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void fetchTorneos();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleCategoria = (cat: CategoriaTorneo) => {
    setForm((prev) => {
      const exists = prev.categoriasSeleccionadas.includes(cat);
      return {
        ...prev,
        categoriasSeleccionadas: exists
          ? prev.categoriasSeleccionadas.filter((c) => c !== cat)
          : [...prev.categoriasSeleccionadas, cat],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/torneos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          descripcionCorta: form.descripcionCorta,
          descripcionLarga: form.descripcionLarga || undefined,
          disciplina: form.disciplina,
          sedeNombre: form.sedeNombre,
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin || undefined,
          estado: form.estado,
          categorias: form.categoriasSeleccionadas,
          reglamentoUrl: form.reglamentoUrl || undefined,
          destacado: form.destacado,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Error al crear el torneo");
      }

      toast.success("Torneo creado correctamente.");
      setForm({
        titulo: "",
        descripcionCorta: "",
        descripcionLarga: "",
        disciplina: "",
        sedeNombre: "",
        fechaInicio: "",
        fechaFin: "",
        estado: "Inscripción abierta",
        categoriasSeleccionadas: ["Infantil"],
        reglamentoUrl: "",
        destacado: true,
      });
      void fetchTorneos();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error inesperado al crear el torneo",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
          Torneos
        </p>
        <h1 className="text-lg font-semibold text-slate-50">
          Crear y administrar torneos
        </h1>
        <p className="text-xs text-slate-400">
          Cargá torneos municipales, ligas barriales y eventos especiales y
          administrá el calendario completo.
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
              placeholder="Fútbol, Básquet, Hockey, etc."
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

        <div className="space-y-1">
          <label
            htmlFor="descripcionLarga"
            className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
          >
            Descripción larga (opcional)
          </label>
          <textarea
            id="descripcionLarga"
            name="descripcionLarga"
            value={form.descripcionLarga}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="sedeNombre"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Sede
            </label>
            <input
              id="sedeNombre"
              name="sedeNombre"
              value={form.sedeNombre}
              onChange={handleChange}
              required
              placeholder="Polideportivo, Club, etc."
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="fechaInicio"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Fecha inicio
            </label>
            <input
              id="fechaInicio"
              name="fechaInicio"
              type="date"
              value={form.fechaInicio}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="fechaFin"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Fecha fin (opcional)
            </label>
            <input
              id="fechaFin"
              name="fechaFin"
              type="date"
              value={form.fechaFin}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="estado"
              className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
            >
              {ESTADOS.map((e) => (
                <option
                  key={e}
                  value={e}
                >
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="destacado"
              name="destacado"
              type="checkbox"
              checked={form.destacado}
              onChange={handleChange}
              className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-sky-500"
            />
            <label
              htmlFor="destacado"
              className="text-xs text-slate-300"
            >
              Mostrar como torneo destacado
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
            Categorías
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((cat) => {
              const checked = form.categoriasSeleccionadas.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategoria(cat)}
                  className={`rounded-full border px-3 py-1 text-[11px] ${
                    checked
                      ? "border-sky-400 bg-sky-500/20 text-sky-100"
                      : "border-slate-600 bg-slate-900 text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="reglamentoUrl"
            className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
          >
            URL del reglamento (PDF o página externa)
          </label>
          <input
            id="reglamentoUrl"
            name="reglamentoUrl"
            value={form.reglamentoUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs outline-none ring-sky-500/40 focus:ring-2"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-950 shadow-sm transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {isSubmitting ? "Guardando..." : "Guardar torneo"}
        </button>

      </form>

      <section className="space-y-2 text-xs text-slate-50">
        <h2 className="text-sm font-semibold text-slate-50">
          Torneos cargados
        </h2>
        {loadingList && (
          <p className="text-xs text-slate-300">Cargando torneos...</p>
        )}
        {errorList && <p className="text-xs text-red-400">{errorList}</p>}
        {!loadingList && !torneos.length && (
          <p className="text-xs text-slate-300">
            Todavía no hay torneos cargados.
          </p>
        )}
        {!loadingList && torneos.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">Disciplina</th>
                  <th className="px-3 py-2 text-left">Título</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-left">Fechas</th>
                  <th className="px-3 py-2 text-left">Destacado</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {torneos.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-slate-800/60 hover:bg-slate-900/60"
                  >
                    <td className="px-3 py-2 text-slate-300">{t.disciplina}</td>
                    <td className="px-3 py-2 text-slate-50">
                      <span className="line-clamp-2">{t.titulo}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-300">{t.estado}</td>
                    <td className="px-3 py-2 text-slate-300">
                      {new Date(t.fechaInicio).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                      {t.fechaFin &&
                        ` al ${new Date(t.fechaFin).toLocaleDateString(
                          "es-AR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}`}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/torneos/${t.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                destacado: !t.destacado,
                              }),
                            });
                            if (!res.ok) throw new Error();
                            setTorneos((prev) =>
                              prev.map((tor) =>
                                tor.id === t.id
                                  ? { ...tor, destacado: !t.destacado }
                                  : tor,
                              ),
                            );
                            toast.success("Torneo actualizado.");
                          } catch {
                            toast.error("No se pudo actualizar el torneo.");
                          }
                        }}
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          t.destacado
                            ? "bg-sky-500/20 text-sky-200"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {t.destacado ? "Sí" : "No"}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-300">
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !confirm("¿Seguro que querés eliminar este torneo?")
                          ) {
                            return;
                          }
                          try {
                            const res = await fetch(`/api/torneos/${t.id}`, {
                              method: "DELETE",
                            });
                            if (!res.ok) throw new Error();
                            setTorneos((prev) =>
                              prev.filter((tor) => tor.id !== t.id),
                            );
                            toast.success("Torneo eliminado.");
                          } catch {
                            toast.error("No se pudo eliminar el torneo.");
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


