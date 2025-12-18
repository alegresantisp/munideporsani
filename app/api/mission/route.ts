import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { isAdminDeportes } from "@/lib/security/roles";
import { missionServerRepository } from "@/services/mission/mission.server.repository";

export async function GET() {
  const content = await missionServerRepository.obtener();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
  if (!isAdminDeportes(decoded)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  await missionServerRepository.guardar(body);
  return NextResponse.json({ ok: true });
}
