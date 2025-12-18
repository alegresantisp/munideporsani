import { firebaseAdminDb } from "@/lib/firebase/adminApp";
import type {
  Noticia,
  NoticiaCreateInput,
  NoticiaUpdateInput,
} from "./noticias.types";

const COLLECTION = "noticias";

export const noticiasServerRepository = {
  async crearNoticia(input: NoticiaCreateInput): Promise<string> {
    const now = new Date().toISOString();
    const ref = await firebaseAdminDb.collection(COLLECTION).add({
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  },

  async actualizarNoticia(id: string, input: NoticiaUpdateInput): Promise<void> {
    await firebaseAdminDb
      .collection(COLLECTION)
      .doc(id)
      .update({
        ...input,
        updatedAt: new Date().toISOString(),
      });
  },

  async obtenerNoticiaPorSlug(slug: string): Promise<Noticia | null> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as Omit<Noticia, "id">),
    };
  },

  async listarNoticiasDestacadas(max = 3): Promise<Noticia[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .where("destacado", "==", true)
      .orderBy("fechaPublicacion", "desc")
      .limit(max)
      .get();
    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as Omit<Noticia, "id">),
        }) satisfies Noticia,
    );
  },

  async listarNoticiasRecientes(max = 12): Promise<Noticia[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .orderBy("fechaPublicacion", "desc")
      .limit(max)
      .get();
    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as Omit<Noticia, "id">),
        }) satisfies Noticia,
    );
  },

  async listarTodasNoticias(): Promise<Noticia[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .orderBy("fechaPublicacion", "desc")
      .get();

    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as Omit<Noticia, "id">),
        }) satisfies Noticia,
    );
  },

  async eliminarNoticia(id: string): Promise<void> {
    await firebaseAdminDb.collection(COLLECTION).doc(id).delete();
  },
};


