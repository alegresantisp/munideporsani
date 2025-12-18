import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { torneosServerRepository } from "@/services/torneos/torneos.server.repository";
import { isAdminDeportes } from "@/lib/security/roles";
import type {
  CategoriaTorneo,
  EstadoTorneo,
} from "@/services/torneos/torneos.types";

type TorneoPayload = {
  titulo: string;
  descripcionCorta: string;
  descripcionLarga?: string;
  disciplina: string;
  sedeNombre: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: EstadoTorneo;
  categorias: CategoriaTorneo[];
  reglamentoUrl?: string;
  destacado: boolean;
};

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

    const body = (await request.json()) as TorneoPayload;

    if (
      !body.titulo ||
      !body.descripcionCorta ||
      !body.disciplina ||
      !body.sedeNombre ||
      !body.fechaInicio
    ) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    const slug = `${body.titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")}-${Date.now().toString(36)}`;

    const now = new Date().toISOString();

    await torneosServerRepository.crearTorneo({
      ...body,
      slug,
      imagenUrl: undefined,
      imagenPublicId: undefined,
      createdAt: now,
      updatedAt: now,
    } as any);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno al crear el torneo" },
      { status: 500 },
    );
  }
}


