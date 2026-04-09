"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SinAccesoPage() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  async function handleGoToLogin() {
    setIsLeaving(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff4ff_0%,#f7fbff_45%,#eef4e8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto grid min-h-[80vh] max-w-4xl place-items-center">
        <section className="w-full rounded-[2rem] border border-amber-200 bg-white p-10 text-center shadow-[0_30px_80px_rgba(146,64,14,0.10)]">
          <p className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-900">
            Acceso restringido
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
            Tu rol no tiene permiso para diligenciar formularios
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Por ahora esta aplicación permite registrar resultados solo a los
            roles <strong>ADMIN</strong> y <strong>EDITOR</strong>.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={handleGoToLogin}
              type="button"
              disabled={isLeaving}
            >
              {isLeaving ? "Saliendo..." : "Cerrar sesion e ir al login"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
