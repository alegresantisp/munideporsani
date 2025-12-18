import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { actividadesServerRepository } from "@/services/actividades/actividades.server.repository";
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

    const actividades =
      await actividadesServerRepository.listarTodasActividades();
    return NextResponse.json(actividades);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno al obtener actividades" },
      { status: 500 },
    );
  }
}


