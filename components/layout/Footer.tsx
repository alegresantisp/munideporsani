export const Footer: React.FC = () => {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} Municipalidad de San Isidro. Todos los
          derechos reservados.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#accesibilidad"
            className="underline-offset-2 hover:underline"
          >
            Política de accesibilidad
          </a>
          <a
            href="#privacidad"
            className="underline-offset-2 hover:underline"
          >
            Privacidad
          </a>
          <a
            href="#contacto"
            className="underline-offset-2 hover:underline"
          >
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
};


