import { HeroLanding } from "@/components/sections/HeroLanding";
import { HeroTagline } from "@/components/sections/HeroTagline";
import { MissionSection } from "@/components/sections/MissionSection";
import { NoticiasDestacadas } from "@/components/sections/NoticiasDestacadas";
import { FeaturedNewsSection } from "@/components/sections/FeaturedNewsSection";
import { AccesosRapidos } from "@/components/sections/AccesosRapidos";
import { noticiasServerRepository } from "@/services/noticias/noticias.server.repository";
import { heroServerRepository } from "@/services/hero/hero.server.repository";
import { missionServerRepository } from "@/services/mission/mission.server.repository";
import { featuredServerRepository } from "@/services/featured/featured.server.repository";

export const revalidate = 60; // ISR: revalidar cada 60 segundos

export default async function Home() {
  const [noticiasDestacadas, heroSlides, heroConfig, missionContent, featuredCards] = await Promise.all([
    noticiasServerRepository.listarNoticiasDestacadas(3),
    heroServerRepository.listarSlides(),
    heroServerRepository.obtenerConfig(),
    missionServerRepository.obtener(),
    featuredServerRepository.getAll(),
  ]);

  return (
    <>
      <HeroLanding slides={heroSlides} />
      <HeroTagline text={heroConfig.tagline} subline={heroConfig.subline} />
      <MissionSection content={missionContent} />
      <FeaturedNewsSection cards={featuredCards} />
      <NoticiasDestacadas noticias={noticiasDestacadas} />
      <AccesosRapidos />
    </>
  );
}

