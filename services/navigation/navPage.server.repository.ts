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
    
    // 1. Save the Page
    if (existing) {
      const snap = await firebaseAdminDb
        .collection(COLLECTION)
        .where("path", "==", input.path)
        .limit(1)
        .get();
        
      if (!snap.empty) {
         await snap.docs[0].ref.update({ ...input, updatedAt });
      }
    } else {
      await firebaseAdminDb.collection(COLLECTION).add({ ...input, updatedAt });
    }

    // 2. Handle Featured Cards
    try {
      const featuredRef = firebaseAdminDb.collection("featured_cards");
      const existingFeatured = await featuredRef.where("pagePath", "==", input.path).get();
      
      const batch = firebaseAdminDb.batch();
      existingFeatured.docs.forEach((doc) => batch.delete(doc.ref));

      if (input.blocks) {
        input.blocks.forEach((block) => {
          if (block.type === "cards_grid") {
            block.cards.forEach((card) => {
              if (card.featured) {
                const docRef = featuredRef.doc();
                batch.set(docRef, {
                  ...card,
                  pagePath: input.path,
                  pageTitle: input.title,
                  updatedAt: new Date().toISOString(),
                });
              }
            });
          }
        });
      }

      await batch.commit();
    } catch (error) {
      console.error("Error updating featured cards:", error);
      // Don't fail the whole request if featured cards fail
    }
  },
};