export type EstadoTorneo = "Inscripción abierta" | "Inscripción cerrada" | "En curso" | "Finalizado";

export type CategoriaTorneo =
  | "Infantil"
  | "Juvenil"
  | "Adultos"
  | "Mayores"
  | "Mixto";

export type Torneo = {
  id: string;
  titulo: string;
  slug: string;
  descripcionCorta: string;
  descripcionLarga?: string;
  disciplina: string;
  categorias: CategoriaTorneo[];
  sedeNombre: string;
  fechaInicio: string; // ISO
  fechaFin?: string; // ISO
  estado: EstadoTorneo;
  reglamentoUrl?: string;
  imagenUrl?: string;
  imagenPublicId?: string;
  destacado: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TorneoCreateInput = Omit<Torneo, "id" | "createdAt" | "updatedAt">;

export type TorneoUpdateInput = Partial<Omit<Torneo, "id" | "createdAt">>;


