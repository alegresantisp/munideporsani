import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { noticiasServerRepository } from "@/services/noticias/noticias.server.repository";
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

    const noticias = await noticiasServerRepository.listarTodasNoticias();
    return NextResponse.json(noticias);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno al obtener noticias" },
      { status: 500 },
    );
  }
}


