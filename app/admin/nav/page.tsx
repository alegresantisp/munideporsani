import { navigationServerRepository } from "@/services/navigation/navigation.server.repository";
import { navSectionServerRepository } from "@/services/navigation/navSection.server.repository";
import type { NavItem, NavSection, NavSectionConfig } from "@/services/navigation/navigation.types";
import NavAdminClient from "./NavAdminClient";

export const dynamic = "force-dynamic";

export default async function NavAdminPage() {
  const sections = await navSectionServerRepository.getAll();
  const itemsEntries = await Promise.all(
    sections.map(async (section) => [section.section, await navigationServerRepository.listBySection(section.section)] as const),
  );

  const items = itemsEntries.reduce((acc, [section, list]) => {
    acc[section] = list;
    return acc;
  }, {} as Record<NavSection, NavItem[]>);

  return <NavAdminClient initialItems={items} initialSections={sections as NavSectionConfig[]} />;
}
