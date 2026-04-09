"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ResultSummary = {
  id: string;
  recordNumber: string;
  process: string;
  indicator: string;
  submittedBy?: string | null;
  compliance: string;
  resultValue: number;
  indicatorPercent: number;
  createdAt: string;
};

export default function RegistrosClient() {
  const [results, setResults] = useState<ResultSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch("/api/results?take=100");
        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message || "No fue posible cargar el historial.");
        }

        const payload = (await response.json()) as {
          results: ResultSummary[];
        };

        setResults(payload.results);
      } catch (error) {
        console.error(error);
        setError(
          error instanceof Error ? error.message : "No fue posible cargar el historial.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff4ff_0%,#f7fbff_45%,#eef4e8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_30px_80px_rgba(20,38,62,0.12)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                Historial completo
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                Registros guardados
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Consulta los envios almacenados en PostgreSQL.
              </p>
            </div>

            <Link
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/formulario"
            >
              Volver al formulario
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(25,50,80,0.08)]">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando registros...</p>
          ) : error ? (
            <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : results.length === 0 ? (
            <p className="text-sm text-slate-500">Todavia no hay registros guardados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-4">Radicado</th>
                    <th className="px-4">Proceso</th>
                    <th className="px-4">Indicador</th>
                    <th className="px-4">Usuario</th>
                    <th className="px-4">Resultado</th>
                    <th className="px-4">% indicador</th>
                    <th className="px-4">Cumple</th>
                    <th className="px-4">Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr
                      key={result.id}
                      className="bg-slate-50 text-sm text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                    >
                      <td className="rounded-l-2xl px-4 py-4 font-semibold text-slate-950">
                        {result.recordNumber}
                      </td>
                      <td className="px-4 py-4">{result.process}</td>
                      <td className="px-4 py-4">{result.indicator}</td>
                      <td className="px-4 py-4">{result.submittedBy || "Sin usuario"}</td>
                      <td className="px-4 py-4">{result.resultValue}</td>
                      <td className="px-4 py-4">{result.indicatorPercent}</td>
                      <td className="px-4 py-4">{result.compliance}</td>
                      <td className="rounded-r-2xl px-4 py-4">
                        {new Date(result.createdAt).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
