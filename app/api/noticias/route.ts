import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/adminApp";
import { cloudinaryUpload } from "@/lib/cloudinary";
import { noticiasServerRepository } from "@/services/noticias/noticias.server.repository";
import type { NoticiaCategoria } from "@/services/noticias/noticias.types";
import { isAdminDeportes } from "@/lib/security/roles";
import { sanitizeHtml } from "@/lib/security/sanitizeHtml";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 },
      );
    }

    const decoded = await firebaseAdminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    if (!isAdminDeportes(decoded)) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const titulo = String(formData.get("titulo") ?? "");
    const cuerpoRaw = String(formData.get("cuerpo") ?? "");
    const categoria = String(formData.get("categoria") ?? "Deportes") as NoticiaCategoria;
    const resumen = String(formData.get("resumen") ?? "");
    const destacadoRaw = String(formData.get("destacado") ?? "true");
    const destacado = destacadoRaw === "true";
    const imagen = formData.get("imagen") as File | null;

    if (!titulo || !cuerpoRaw) {
      return NextResponse.json(
        { message: "Título y cuerpo son obligatorios" },
        { status: 400 },
      );
    }

    const cuerpo = sanitizeHtml(cuerpoRaw);

    let imagenUrl: string | undefined;
    let imagenPublicId: string | undefined;

    if (imagen) {
      const arrayBuffer = await imagen.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const dataUri = `data:${imagen.type};base64,${base64}`;

      const uploadResult = await cloudinaryUpload(
        dataUri,
        "muni-san-isidro/deportes/noticias",
      );
      imagenUrl = uploadResult.url;
      imagenPublicId = uploadResult.publicId;
    }

    const slug = `${titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")}-${Date.now().toString(36)}`;

    const fechaPublicacion = new Date().toISOString();

    await noticiasServerRepository.crearNoticia({
      titulo,
      slug,
      cuerpo,
      resumen,
      categoria,
      imagenUrl,
      imagenPublicId,
      fechaPublicacion,
      destacado,
      createdAt: fechaPublicacion,
      updatedAt: fechaPublicacion,
    } as any);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno al crear la noticia" },
      { status: 500 },
    );
  }
}


