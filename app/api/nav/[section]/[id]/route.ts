import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { isAdminDeportes } from "@/lib/security/roles";
import { navigationServerRepository } from "@/services/navigation/navigation.server.repository";
import type { NavSection } from "@/services/navigation/navigation.types";

export async function PATCH(request: Request, { params }: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params;
  const sec = section as NavSection;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
  if (!isAdminDeportes(decoded)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  await navigationServerRepository.update(id, { ...body, section: sec });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ section: string; id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
  if (!isAdminDeportes(decoded)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await navigationServerRepository.remove(id);
  return NextResponse.json({ ok: true });
}
