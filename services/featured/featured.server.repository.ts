import { firebaseAdminDb } from "@/lib/firebase/adminApp";

export interface FeaturedCard {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  modalTitle?: string;
  modalContent?: string;
  modalImages?: string[];
  titleFont?: string;
  descFont?: string;
  titleSize?: string;
  descSize?: string;
  pagePath: string;
  pageTitle: string;
  updatedAt: string;
}

export const featuredServerRepository = {
  async getAll(): Promise<FeaturedCard[]> {
    const snapshot = await firebaseAdminDb
      .collection("featured_cards")
      .orderBy("updatedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FeaturedCard));
  },
};
