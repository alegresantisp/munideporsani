"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import type { NavItem, NavSectionConfig } from "@/services/navigation/navigation.types";

type SectionWithItems = NavSectionConfig & { items: NavItem[] };

type Props = {
  sections: SectionWithItems[];
};

export const Navbar: React.FC<Props> = ({ sections }) => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = (key: string) => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    setOpenKey(key);
  };

  const handleLeave = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setOpenKey(null), 200);
  };

  const baseLinks = sections.map((section) => ({
    name: section.label,
    href: `/${section.section}`,
    children: section.items,
  }));
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <header className="w-full max-w-4xl rounded-full border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl shadow-sky-900/5 ring-1 ring-black/5 transition-all hover:bg-white/80">
        <div className="flex h-14 items-center justify-between px-2 pl-4 pr-2 sm:px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
              <Image
                src="/logo-san-isidro.png"
                alt="Municipalidad de San Isidro"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-sky-600">
                  Deportes
                </span>
                <span className="text-xs font-bold text-slate-900">
                  San Isidro
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1 rounded-full bg-slate-100/50 p-1">
            {baseLinks.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => handleEnter(item.name)}
                onMouseLeave={handleLeave}
              >
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-[10px] lg:text-xs font-semibold text-slate-600 transition-all hover:bg-white hover:text-sky-600 hover:shadow-sm whitespace-nowrap"
                >
                  {item.name}
                </Link>
                {item.children && item.children.length > 0 && (
                  <div
                    className={`absolute left-0 top-full mt-2 min-w-[200px] rounded-xl border border-slate-200 bg-white shadow-lg transition-opacity duration-150 z-50 ${openKey === item.name ? "visible opacity-100" : "invisible opacity-0"}`}
                    onMouseEnter={() => handleEnter(item.name)}
                    onMouseLeave={handleLeave}
                  >
                    <ul className="py-2">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={child.href}
                            className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <span className="truncate">{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Espacio vacío o botón de menú móvil si se agrega en el futuro */}
          <div className="w-8 md:hidden" /> 
        </div>
      </header>
    </div>
  );
};


