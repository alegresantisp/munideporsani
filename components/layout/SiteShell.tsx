"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import type { NavItem, NavSection, NavSectionConfig } from "@/services/navigation/navigation.types";

interface SiteShellProps {
  children: React.ReactNode;
  navSections: NavSectionConfig[];
  navItems: Record<NavSection, NavItem[]>;
}

export function SiteShell({ children, navSections, navItems }: SiteShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const hideNavbar = pathname === "/login";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!hideNavbar && (
        <Navbar
          sections={navSections.map((section) => ({
            ...section,
            items: navItems[section.section] ?? [],
          }))}
        />
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
