import { NextResponse } from "next/server";
import { heroServerRepository } from "@/services/hero/hero.server.repository";
import { isAdminDeportes } from "@/lib/security/roles";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { cookies } from "next/headers";

export async function GET() {
  const slides = await heroServerRepository.listarTodosSlides();
  return NextResponse.json(slides);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
  if (!isAdminDeportes(decoded)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const id = await heroServerRepository.crearSlide(body);
  return NextResponse.json({ id });
}
