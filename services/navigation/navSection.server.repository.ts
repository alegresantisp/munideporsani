import { firebaseAdminDb } from "@/lib/firebase/adminApp";
import type { NavSection, NavSectionConfig, NavSectionCreateInput, NavSectionUpdateInput } from "./navigation.types";

const COLLECTION = "nav_sections";
const MAX_SECTIONS = 7;

const defaults: NavSectionConfig[] = [
  { section: "institucional", label: "Institucional", order: 1, active: true },
  { section: "programas", label: "Programas", order: 2, active: true },
  { section: "tramites", label: "Trámites", order: 3, active: true },
  { section: "delegaciones", label: "Delegaciones", order: 4, active: true },
  { section: "prensa", label: "Prensa", order: 5, active: true },
];

const normalize = (data: Partial<NavSectionConfig>, fallbackId: string): NavSectionConfig => ({
  section: data.section ?? (fallbackId as NavSection),
  label: data.label ?? fallbackId,
  order: data.order ?? 999,
  active: data.active ?? true,
});

export const navSectionServerRepository = {
  async getAll(): Promise<NavSectionConfig[]> {
    const snapshot = await firebaseAdminDb.collection(COLLECTION).get();
    const map = new Map<string, NavSectionConfig>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Partial<NavSectionConfig>;
      const cfg = normalize({ ...data, section: data.section ?? (doc.id as NavSection) }, doc.id);
      map.set(cfg.section, cfg);
    });

    defaults.forEach((def) => {
      if (!map.has(def.section)) {
        map.set(def.section, def);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.order === b.order) return a.section.localeCompare(b.section);
      return a.order - b.order;
    });
  },

  async listActive(limit = MAX_SECTIONS): Promise<NavSectionConfig[]> {
    const all = await this.getAll();
    return all.filter((s) => s.active).slice(0, limit);
  },

  async create(input: NavSectionCreateInput): Promise<void> {
    const all = await this.getAll();
    if (all.length >= MAX_SECTIONS) {
      throw new Error("MAX_SECTIONS");
    }
    const activeCount = all.filter((s) => s.active).length;
    if (input.active !== false && activeCount >= MAX_SECTIONS) {
      throw new Error("MAX_SECTIONS");
    }
    const data: NavSectionConfig = {
      section: input.section,
      label: input.label,
      order: input.order ?? activeCount + 1,
      active: input.active ?? true,
    } as NavSectionConfig;
    await firebaseAdminDb.collection(COLLECTION).doc(data.section).set(data, { merge: false });
  },

  async upsert(section: NavSection, input: NavSectionUpdateInput): Promise<void> {
    const docRef = firebaseAdminDb.collection(COLLECTION).doc(section);
    const snap = await docRef.get();
    const existing = snap.exists ? (snap.data() as Partial<NavSectionConfig>) : null;

    const current = normalize(existing ?? { section }, section);
    const next: NavSectionConfig = {
      section,
      label: input.label ?? current.label,
      order: input.order ?? current.order,
      active: input.active ?? current.active,
    };

    if (!current.active && next.active) {
      const activeCount = (await this.listActive(MAX_SECTIONS + 1)).length;
      if (activeCount >= MAX_SECTIONS) {
        throw new Error("MAX_SECTIONS");
      }
    }

    await docRef.set(next, { merge: true });
  },
};