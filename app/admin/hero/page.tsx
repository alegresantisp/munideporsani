import { heroServerRepository } from "@/services/hero/hero.server.repository";
import HeroAdminClient from "./HeroAdminClient";

export const dynamic = "force-dynamic";

export default async function HeroAdminPage() {
  const slides = await heroServerRepository.listarTodosSlides();
  return <HeroAdminClient initialSlides={slides} />;
}
