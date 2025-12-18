import { firebaseAdminDb } from "@/lib/firebase/adminApp";
import type {
  Torneo,
  TorneoCreateInput,
  TorneoUpdateInput,
} from "./torneos.types";

const COLLECTION = "torneos";

export const torneosServerRepository = {
  async crearTorneo(input: TorneoCreateInput): Promise<string> {
    const now = new Date().toISOString();
    const ref = await firebaseAdminDb.collection(COLLECTION).add({
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  },

  async actualizarTorneo(id: string, input: TorneoUpdateInput): Promise<void> {
    await firebaseAdminDb.collection(COLLECTION).doc(id).update({
      ...input,
      updatedAt: new Date().toISOString(),
    });
  },

  async listarTorneos(): Promise<Torneo[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .orderBy("fechaInicio", "asc")
      .get();

    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as Omit<Torneo, "id">),
        }) satisfies Torneo,
    );
  },

  async listarTorneosDestacados(max = 6): Promise<Torneo[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .where("destacado", "==", true)
      .orderBy("fechaInicio", "asc")
      .limit(max)
      .get();

    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as Omit<Torneo, "id">),
        }) satisfies Torneo,
    );
  },

  async obtenerPorSlug(slug: string): Promise<Torneo | null> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as Omit<Torneo, "id">),
    };
  },

  async eliminarTorneo(id: string): Promise<void> {
    await firebaseAdminDb.collection(COLLECTION).doc(id).delete();
  },
};


