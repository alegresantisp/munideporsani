export type NavSection = string;

export interface NavItem {
  id: string;
  section: NavSection;
  label: string;
  href: string;
  order: number;
  active: boolean;
}

export type NavItemCreateInput = Omit<NavItem, "id">;
export type NavItemUpdateInput = Partial<NavItemCreateInput>;

export interface NavSectionConfig {
  section: NavSection;
  label: string;
  order: number;
  active: boolean;
}

export type NavSectionCreateInput = NavSectionConfig;
export type NavSectionUpdateInput = Partial<Omit<NavSectionConfig, "section">>;