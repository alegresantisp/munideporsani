import { firebaseAdminDb } from "@/lib/firebase/adminApp";
import type {
  HeroSlide,
  HeroSlideCreateInput,
  HeroSlideUpdateInput,
  HeroConfig,
  HeroConfigUpdateInput,
} from "./hero.types";

const COLLECTION = "hero_slides";
const CONFIG_COLLECTION = "hero_config";
const CONFIG_ID = "config";

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

  async contarSlides(): Promise<number> {
    const snapshot = await firebaseAdminDb.collection(COLLECTION).select().get();
    return snapshot.size;
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

  async obtenerConfig(): Promise<HeroConfig> {
    const doc = await firebaseAdminDb.collection(CONFIG_COLLECTION).doc(CONFIG_ID).get();
    if (!doc.exists) {
      return {
        tagline: "Promoviendo el deporte sanisidrense",
        subline: "Energía, pasión y oportunidades para todos.",
      };
    }
    return doc.data() as HeroConfig;
  },

  async guardarConfig(input: HeroConfigUpdateInput): Promise<void> {
    await firebaseAdminDb
      .collection(CONFIG_COLLECTION)
      .doc(CONFIG_ID)
      .set(input, { merge: true });
  },
};
