import { firebaseAdminDb } from "@/lib/firebase/adminApp";
import type { NavPageContent, NavPageUpsertInput } from "./navPage.types";

const COLLECTION = "nav_pages";

export const navPageServerRepository = {
  async getByPath(path: string): Promise<NavPageContent | null> {
    const snapshot = await firebaseAdminDb
      .collection(COLLECTION)
      .where("path", "==", path)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as NavPageContent;
  },

  async upsert(input: NavPageUpsertInput): Promise<void> {
    const existing = await this.getByPath(input.path);
    const updatedAt = new Date().toISOString();
    if (existing) {
      await firebaseAdminDb
        .collection(COLLECTION)
        .where("path", "==", input.path)
        .limit(1)
        .get()
        .then(async (snap) => {
          const doc = snap.docs[0];
          await doc.ref.update({ ...input, updatedAt });
        });
    } else {
      await firebaseAdminDb.collection(COLLECTION).add({ ...input, updatedAt });
    }
  },
};