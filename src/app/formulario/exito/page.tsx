import Link from "next/link";

type ExitoPageProps = {
  searchParams: Promise<{
    radicado?: string;
  }>;
};

export default async function ExitoPage({ searchParams }: ExitoPageProps) {
  const params = await searchParams;
  const radicado = params.radicado;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff4ff_0%,#f7fbff_45%,#eef4e8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto grid min-h-[80vh] max-w-4xl place-items-center">
        <section className="w-full rounded-[2rem] border border-emerald-200 bg-white p-10 text-center shadow-[0_30px_80px_rgba(20,83,45,0.12)]">
          <p className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-900">
            Envio finalizado
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
            El formulario se registro correctamente
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            El radicado generado para este envio es:
          </p>
          <div className="mt-6 rounded-[1.5rem] bg-emerald-50 px-6 py-5 text-3xl font-semibold text-emerald-950">
            {radicado || "Sin radicado"}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/formulario"
            >
              Crear otro formulario
            </Link>
            <Link
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              href="/login"
            >
              Volver al login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
