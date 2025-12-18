import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Panel de administración · Deportes San Isidro",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
        <aside className="hidden w-64 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
            Panel interno
          </p>
          <h2 className="mt-2 text-sm font-semibold text-slate-50">
            Secretaría de Deportes
          </h2>
          <nav className="mt-4 space-y-2 text-xs text-slate-300">
            <ul className="space-y-1">
              <li>
                <Link href="/admin/hero" className="hover:text-sky-300">
                  Hero (portada)
                </Link>
              </li>
              <li>
                <Link href="/admin/nav" className="hover:text-sky-300">
                  Menú (desplegables)
                </Link>
              </li>
              <li>
                <Link href="/admin/mision" className="hover:text-sky-300">
                  Nuestra Misión
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-sky-300">
                  Crear noticia
                </Link>
              </li>
              <li>
                <Link href="/admin/noticias" className="hover:text-sky-300">
                  Listar noticias
                </Link>
              </li>
              <li>
                <Link href="/admin/actividades" className="hover:text-sky-300">
                  Actividades
                </Link>
              </li>
              <li>
                <Link href="/admin/torneos" className="hover:text-sky-300">
                  Torneos
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        <section className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
          {children}
        </section>
      </div>
    </div>
  );
}


