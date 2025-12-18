import { heroServerRepository } from "@/services/hero/hero.server.repository";
import HeroAdminClient from "./HeroAdminClient";

export const dynamic = "force-dynamic";

export default async function HeroAdminPage() {
  const [slides, config] = await Promise.all([
    heroServerRepository.listarTodosSlides(),
    heroServerRepository.obtenerConfig(),
  ]);
  return <HeroAdminClient initialSlides={slides} initialConfig={config} />;
}
