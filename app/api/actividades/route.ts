import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { isAdminDeportes } from "@/lib/security/roles";
import { actividadesServerRepository } from "@/services/actividades/actividades.server.repository";
import type {
  DiaSemana,
  HorarioActividad,
  NivelActividad,
  TipoActividad,
} from "@/services/actividades/actividades.types";

type ActividadPayload = {
  titulo: string;
  descripcionCorta: string;
  disciplina: string;
  tipo: TipoActividad;
  nivel: NivelActividad;
  sedeId?: string;
  sedeNombre: string;
  cupo?: number;
  edadMin?: number;
  edadMax?: number;
  horarios: HorarioActividad[];
  activa: boolean;
};

const DIAS_VALIDOS: DiaSemana[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 },
      );
    }

    const decoded = await firebaseAdminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    if (!isAdminDeportes(decoded)) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as ActividadPayload;

    if (!body.titulo || !body.disciplina || !body.sedeNombre) {
      return NextResponse.json(
        { message: "Título, disciplina y sede son obligatorios" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.horarios) || body.horarios.length === 0) {
      return NextResponse.json(
        { message: "Debe indicar al menos un horario" },
        { status: 400 },
      );
    }

    const horariosValidados: HorarioActividad[] = body.horarios.map((h) => {
      if (!DIAS_VALIDOS.includes(h.dia)) {
        throw new Error("Día de la semana inválido");
      }
      return {
        dia: h.dia,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
      };
    });

    const now = new Date().toISOString();

    await actividadesServerRepository.crearActividad({
      ...body,
      horarios: horariosValidados,
      imagenUrl: undefined,
      imagenPublicId: undefined,
      createdAt: now,
      updatedAt: now,
    } as any);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno al crear la actividad" },
      { status: 500 },
    );
  }
}


