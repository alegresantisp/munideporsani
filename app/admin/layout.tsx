import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de administración · Deportes San Isidro",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-64px-64px)] bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
        <aside className="hidden w-64 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
            Panel interno
          </p>
          <h2 className="mt-2 text-sm font-semibold text-slate-50">
            Secretaría de Deportes
          </h2>
          <nav className="mt-4 space-y-2 text-xs text-slate-300">
            <p className="font-semibold text-slate-400">Contenido</p>
            <ul className="space-y-1">
              <li>
                <a
                  href="/admin"
                  className="hover:text-sky-300"
                >
                  Crear noticia
                </a>
              </li>
              <li>
                <a
                  href="/admin/noticias"
                  className="hover:text-sky-300"
                >
                  Listar noticias
                </a>
              </li>
              <li>
                <a
                  href="/admin/actividades"
                  className="hover:text-sky-300"
                >
                  Actividades
                </a>
              </li>
              <li>
                <a
                  href="/admin/torneos"
                  className="hover:text-sky-300"
                >
                  Torneos
                </a>
              </li>
              <li>
                <a
                  href="/admin/hero"
                  className="hover:text-sky-300"
                >
                  Hero / Carrusel
                </a>
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


