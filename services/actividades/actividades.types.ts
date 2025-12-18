export type NivelActividad = "Inicial" | "Intermedio" | "Avanzado" | "Mixto";

export type TipoActividad =
  | "Escuela"
  | "Entrenamiento"
  | "Recreativa"
  | "Competitiva";

export type DiaSemana =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

export type HorarioActividad = {
  dia: DiaSemana;
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
};

export type Actividad = {
  id: string;
  titulo: string;
  descripcionCorta: string;
  descripcionLarga?: string;
  disciplina: string;
  tipo: TipoActividad;
  nivel: NivelActividad;
  sedeId: string;
  sedeNombre: string;
  cupo?: number;
  edadMin?: number;
  edadMax?: number;
  horarios: HorarioActividad[];
  imagenUrl?: string;
  imagenPublicId?: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ActividadCreateInput = Omit<
  Actividad,
  "id" | "createdAt" | "updatedAt"
>;

export type ActividadUpdateInput = Partial<Omit<Actividad, "id" | "createdAt">>;


