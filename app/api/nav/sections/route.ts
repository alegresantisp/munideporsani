import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { isAdminDeportes } from "@/lib/security/roles";
import { navSectionServerRepository } from "@/services/navigation/navSection.server.repository";
import type { NavSectionCreateInput, NavSectionUpdateInput, NavSection } from "@/services/navigation/navigation.types";

export async function GET() {
  const data = await navSectionServerRepository.getAll();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
  if (!isAdminDeportes(decoded)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as Partial<NavSectionCreateInput>;
  if (!body.section || !body.label) return NextResponse.json({ error: "section y label son requeridos" }, { status: 400 });

  try {
    await navSectionServerRepository.create({
      section: body.section as NavSection,
      label: body.label,
      order: body.order ?? 99,
      active: body.active ?? true,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.message === "MAX_SECTIONS" ? "Máximo de 7 secciones" : "No se pudo crear";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
  if (!isAdminDeportes(decoded)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as Partial<NavSectionUpdateInput> & { section?: NavSection };
  if (!body.section) return NextResponse.json({ error: "section es requerido" }, { status: 400 });

  try {
    await navSectionServerRepository.upsert(body.section, {
      label: body.label,
      order: body.order,
      active: body.active,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.message === "MAX_SECTIONS" ? "Máximo de 7 secciones" : "No se pudo actualizar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
