import { firebaseAdminDb } from "@/lib/firebase/adminApp";
import type {
  NavItem,
  NavItemCreateInput,
  NavItemUpdateInput,
  NavSection,
} from "./navigation.types";

const COLLECTION = "nav_links";

export const navigationServerRepository = {
  async listBySection(section: NavSection): Promise<NavItem[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .where("section", "==", section)
      .orderBy("order", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<NavItem, "id">),
    }));
  },

  async listActiveBySection(section: NavSection): Promise<NavItem[]> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .where("section", "==", section)
      .where("active", "==", true)
      .orderBy("order", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<NavItem, "id">),
    }));
  },

  async create(input: NavItemCreateInput): Promise<string> {
    const ref = await firebaseAdminDb.collection(COLLECTION).add(input);
    return ref.id;
  },

  async update(id: string, input: NavItemUpdateInput): Promise<void> {
    await firebaseAdminDb.collection(COLLECTION).doc(id).update(input);
  },

  async remove(id: string): Promise<void> {
    await firebaseAdminDb.collection(COLLECTION).doc(id).delete();
  },
};