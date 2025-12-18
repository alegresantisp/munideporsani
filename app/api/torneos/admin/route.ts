import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { torneosServerRepository } from "@/services/torneos/torneos.server.repository";
import { isAdminDeportes } from "@/lib/security/roles";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const decoded = await firebaseAdminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    if (!isAdminDeportes(decoded)) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const torneos = await torneosServerRepository.listarTorneos();
    return NextResponse.json(torneos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno al obtener torneos" },
      { status: 500 },
    );
  }
}


