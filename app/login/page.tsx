import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px-64px)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Acceso interno
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
          Panel de Deportes
        </h1>
        <p className="mb-4 mt-1 text-xs text-slate-600">
          Ingresá con tu usuario institucional para administrar contenidos de la
          Secretaría de Deportes.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}


