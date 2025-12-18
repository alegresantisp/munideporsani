import Link from "next/link";
import Image from "next/image";

export const Navbar: React.FC = () => {
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
            {[
              { name: "Institucional", href: "/institucional" },
              { name: "Programas", href: "/programas" },
              { name: "Polo Deportivo Kempes", href: "/polo-deportivo-kempes" },
              { name: "Trámites", href: "/tramites" },
              { name: "Prensa", href: "/prensa" },
              { name: "EMMAC", href: "/emmac" },
              { name: "Contacto", href: "/contacto" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-[10px] lg:text-xs font-semibold text-slate-600 transition-all hover:bg-white hover:text-sky-600 hover:shadow-sm whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Espacio vacío o botón de menú móvil si se agrega en el futuro */}
          <div className="w-8 md:hidden" /> 
        </div>
      </header>
    </div>
  );
};


