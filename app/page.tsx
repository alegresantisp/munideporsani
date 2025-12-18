import { HeroLanding } from "@/components/sections/HeroLanding";
import { NoticiasDestacadas } from "@/components/sections/NoticiasDestacadas";
import { AccesosRapidos } from "@/components/sections/AccesosRapidos";
import { noticiasServerRepository } from "@/services/noticias/noticias.server.repository";
import { heroServerRepository } from "@/services/hero/hero.server.repository";

export const revalidate = 60; // ISR: revalidar cada 60 segundos

export default async function Home() {
  const [noticiasDestacadas, heroSlides] = await Promise.all([
    noticiasServerRepository.listarNoticiasDestacadas(3),
    heroServerRepository.listarSlides(),
  ]);

  return (
    <>
      <HeroLanding slides={heroSlides} />
      <NoticiasDestacadas noticias={noticiasDestacadas} />
      <AccesosRapidos />
    </>
  );
}

