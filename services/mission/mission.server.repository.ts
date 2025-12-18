import { firebaseAdminDb } from "@/lib/firebase/adminApp";
import type { MissionContent, MissionUpdateInput } from "./mission.types";

const COLLECTION = "mission_section";
const DOC_ID = "content";

const defaultMission: MissionContent = {
  title: "Nuestra Misión",
  body:
    "Nos proponemos como meta principal promover el deporte como instrumento para la integración social, impulsando la incorporación de las prácticas deportivas en las instituciones. Capacitamos y formamos agentes deportivos, apoyamos a deportistas destacados y acompañamos con infraestructura para que el deporte sea un motor de oportunidades.",
  author: "Secretaría de Deportes",
  role: "Municipio de San Isidro",
  organization: "Deportes San Isidro",
  imageUrl: "/mision-default.jpg",
};

export const missionServerRepository = {
  async obtener(): Promise<MissionContent> {
    const doc = await firebaseAdminDb.collection(COLLECTION).doc(DOC_ID).get();
    if (!doc.exists) return defaultMission;
    return { ...defaultMission, ...(doc.data() as MissionContent) };
  },

  async guardar(input: MissionUpdateInput): Promise<void> {
    await firebaseAdminDb.collection(COLLECTION).doc(DOC_ID).set(input, { merge: true });
  },
};
