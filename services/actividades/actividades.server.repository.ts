import { firebaseAdminDb } from "@/lib/firebase/adminApp";
import type {
  Actividad,
  ActividadCreateInput,
  ActividadUpdateInput,
} from "./actividades.types";

const COLLECTION = "actividades";

export const actividadesServerRepository = {
  async crearActividad(input: ActividadCreateInput): Promise<string> {
    const now = new Date().toISOString();
    const ref = await firebaseAdminDb.collection(COLLECTION).add({
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  },

  async actualizarActividad(
    id: string,
    input: ActividadUpdateInput,
  ): Promise<void> {
    await firebaseAdminDb.collection(COLLECTION).doc(id).update({
      ...input,
      updatedAt: new Date().toISOString(),
    });
  },

  async listarActividadesActivas(): Promise<Actividad[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .where("activa", "==", true)
      .orderBy("disciplina", "asc")
      .get();

    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as Omit<Actividad, "id">),
        }) satisfies Actividad,
    );
  },

  async listarTodasActividades(): Promise<Actividad[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .orderBy("disciplina", "asc")
      .get();

    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as Omit<Actividad, "id">),
        }) satisfies Actividad,
    );
  },

  async eliminarActividad(id: string): Promise<void> {
    await firebaseAdminDb.collection(COLLECTION).doc(id).delete();
  },
};


