import { navigationServerRepository } from "@/services/navigation/navigation.server.repository";
import { navSectionServerRepository } from "@/services/navigation/navSection.server.repository";
import type { NavItem, NavSection, NavSectionConfig } from "@/services/navigation/navigation.types";
import NavContentAdminClient from "./NavContentAdminClient";

export const dynamic = "force-dynamic";

export default async function NavContentPage({ searchParams }: { searchParams: { path?: string } }) {
  const path = searchParams?.path ?? "";
  const sections = await navSectionServerRepository.getAll();
  const itemsEntries = await Promise.all(
    sections.map(async (section) => [section.section, await navigationServerRepository.listBySection(section.section)] as const),
  );

  const items = itemsEntries.reduce((acc, [section, list]) => {
    acc[section] = list;
    return acc;
  }, {} as Record<NavSection, NavItem[]>);

  const all = sections.flatMap((section) => items[section.section] ?? []);
  const current = all.find((i) => i.href === path);

  return (
    <NavContentAdminClient
      navItems={all}
      currentPath={path}
      currentItem={current ?? null}
      sections={sections as NavSectionConfig[]}
    />
  );
}
