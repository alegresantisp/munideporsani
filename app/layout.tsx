import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { AppToaster } from "@/components/ui/AppToaster";
import { navigationServerRepository } from "@/services/navigation/navigation.server.repository";
import { navSectionServerRepository } from "@/services/navigation/navSection.server.repository";
import type { NavSectionConfig, NavSection, NavItem } from "@/services/navigation/navigation.types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secretaría de Deportes · Municipio de San Isidro",
  description:
    "Portal institucional y de servicios deportivos de la Secretaría de Deportes del Municipio de San Isidro.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sections = await navSectionServerRepository.listActive();
  const itemsEntries = await Promise.all(
    sections.map(async (section) => [section.section, await navigationServerRepository.listActiveBySection(section.section)] as const),
  );

  const itemsBySection = itemsEntries.reduce((acc, [section, list]) => {
    acc[section] = list;
    return acc;
  }, {} as Record<NavSection, NavItem[]>);

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <SiteShell
          navSections={sections as NavSectionConfig[]}
          navItems={itemsBySection}
        >
          {children}
        </SiteShell>
        <AppToaster />
      </body>
    </html>
  );
}

