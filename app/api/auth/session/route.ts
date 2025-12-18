import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken: string };

    if (!idToken) {
      return NextResponse.json(
        { message: "Token inválido" },
        { status: 400 },
      );
    }

    // Expira en 5 días por ejemplo
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await firebaseAdminAuth.createSessionCookie(
      idToken,
      { expiresIn },
    );

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: expiresIn / 1000,
      sameSite: "lax",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "No se pudo crear la sesión" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "No se pudo cerrar la sesión" },
      { status: 500 },
    );
  }
}


