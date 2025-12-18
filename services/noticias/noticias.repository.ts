import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase/clientApp";
import type {
  Noticia,
  NoticiaCreateInput,
  NoticiaUpdateInput,
} from "./noticias.types";

const COLLECTION = "noticias";

const mapDocToNoticia = (snapshot: firebase.firestore.QueryDocumentSnapshot): Noticia => {
  const data = snapshot.data() as Omit<Noticia, "id">;
  return {
    id: snapshot.id,
    ...data,
  };
};

export const noticiasRepository = {
  async crearNoticia(input: NoticiaCreateInput): Promise<string> {
    const { db } = getFirebaseClient();
    const now = new Date().toISOString();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  },

  async actualizarNoticia(id: string, input: NoticiaUpdateInput): Promise<void> {
    const { db } = getFirebaseClient();
    const noticiaRef = doc(db, COLLECTION, id);
    await updateDoc(noticiaRef, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
  },

  async obtenerNoticiaPorSlug(slug: string): Promise<Noticia | null> {
    const { db } = getFirebaseClient();
    const q = query(
      collection(db, COLLECTION),
      where("slug", "==", slug),
      limit(1),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const docSnap = snapshot.docs[0]!;
    return mapDocToNoticia(docSnap as any);
  },

  async obtenerNoticiaPorId(id: string): Promise<Noticia | null> {
    const { db } = getFirebaseClient();
    const noticiaRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(noticiaRef);
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Noticia, "id">),
    };
  },

  async listarNoticiasDestacadas(
    max = 3,
  ): Promise<Noticia[]> {
    const { db } = getFirebaseClient();
    const q = query(
      collection(db, COLLECTION),
      where("destacado", "==", true),
      orderBy("fechaPublicacion", "desc"),
      limit(max),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as Omit<Noticia, "id">),
        }) satisfies Noticia,
    );
  },

  async listarNoticiasRecientes(max = 12): Promise<Noticia[]> {
    const { db } = getFirebaseClient();
    const q = query(
      collection(db, COLLECTION),
      orderBy("fechaPublicacion", "desc"),
      limit(max),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as Omit<Noticia, "id">),
        }) satisfies Noticia,
    );
  },
};


