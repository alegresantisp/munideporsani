import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { isAdminDeportes } from "@/lib/security/roles";
import { navPageServerRepository } from "@/services/navigation/navPage.server.repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "path requerido" }, { status: 400 });
  const data = await navPageServerRepository.getByPath(path);
  if (!data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
  if (!isAdminDeportes(decoded)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  if (!body?.path) return NextResponse.json({ error: "path requerido" }, { status: 400 });
  await navPageServerRepository.upsert(body);
  return NextResponse.json({ ok: true });
}
