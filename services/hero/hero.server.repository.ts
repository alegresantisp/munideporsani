import { firebaseAdminDb } from "@/lib/firebase/adminApp";
import type { HeroSlide, HeroSlideCreateInput, HeroSlideUpdateInput } from "./hero.types";

const COLLECTION = "hero_slides";

export const heroServerRepository = {
  async listarSlides(): Promise<HeroSlide[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .where("active", "==", true)
      .orderBy("order", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<HeroSlide, "id">),
    }));
  },

  async listarTodosSlides(): Promise<HeroSlide[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .orderBy("order", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<HeroSlide, "id">),
    }));
  },

  async crearSlide(input: HeroSlideCreateInput): Promise<string> {
    const ref = await firebaseAdminDb.collection(COLLECTION).add(input);
    return ref.id;
  },

  async actualizarSlide(id: string, input: HeroSlideUpdateInput): Promise<void> {
    await firebaseAdminDb.collection(COLLECTION).doc(id).update(input);
  },

  async eliminarSlide(id: string): Promise<void> {
    await firebaseAdminDb.collection(COLLECTION).doc(id).delete();
  },
};
