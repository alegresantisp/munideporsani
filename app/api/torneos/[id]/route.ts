import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { torneosServerRepository } from "@/services/torneos/torneos.server.repository";
import { isAdminDeportes } from "@/lib/security/roles";
import type { TorneoUpdateInput } from "@/services/torneos/torneos.types";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

async function ensureAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { ok: false, status: 401 as const };
  }

  const decoded = await firebaseAdminAuth.verifySessionCookie(
    sessionCookie,
    true,
  );

  if (!isAdminDeportes(decoded)) {
    return { ok: false, status: 403 as const };
  }

  return { ok: true as const };
}

export async function PATCH(request: Request, props: RouteParams) {
  try {
    const auth = await ensureAdmin();
    if (!auth.ok) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: auth.status },
      );
    }

    const { id } = await props.params;
    const body = (await request.json()) as TorneoUpdateInput;

    await torneosServerRepository.actualizarTorneo(id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno al actualizar el torneo" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, props: RouteParams) {
  try {
    const auth = await ensureAdmin();
    if (!auth.ok) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: auth.status },
      );
    }

    const { id } = await props.params;
    await torneosServerRepository.eliminarTorneo(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno al eliminar el torneo" },
      { status: 500 },
    );
  }
}


