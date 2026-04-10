"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminNavigation from "@/app/_components/admin-navigation";

type ProcessOption = {
  id: string;
  name: string;
};

type IndicatorSummary = {
  id: string;
  code: string;
  name: string;
  processId: string;
  processName: string;
  management: string;
  evaluator: string;
  periodicity: string;
  level: string;
  unit: string;
  strategy: string | null;
  status: string;
  deficientGoal: number;
  acceptableGoal: number;
  objectiveGoal: number;
  variableNames: string[];
  updatedAt: string;
};

const emptyForm = {
  code: "",
  name: "",
  processId: "",
  management: "",
  evaluator: "",
  periodicity: "",
  level: "",
  unit: "",
  strategy: "",
  status: "Activo",
  deficientGoal: "",
  acceptableGoal: "",
  objectiveGoal: "",
  variableNames: Array.from({ length: 8 }, (_, index) => `Variable ${index + 1}`),
};

export default function IndicadoresAdminClient() {
  const [processes, setProcesses] = useState<ProcessOption[]>([]);
  const [indicators, setIndicators] = useState<IndicatorSummary[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/indicators", {
          cache: "no-store",
          credentials: "include",
        });
        const payload = (await response.json()) as {
          message?: string;
          processes?: ProcessOption[];
          indicators?: IndicatorSummary[];
        };

        if (!response.ok) {
          throw new Error(payload.message || "No fue posible cargar indicadores.");
        }

        setProcesses(payload.processes ?? []);
        setIndicators(payload.indicators ?? []);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible cargar indicadores.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function setVariable(index: number, value: string) {
    setForm((current) => {
      const variableNames = [...current.variableNames];
      variableNames[index] = value;
      return { ...current, variableNames };
    });
  }

  function startEdit(indicator: IndicatorSummary) {
    setEditingId(indicator.id);
    setForm({
      code: indicator.code,
      name: indicator.name,
      processId: indicator.processId,
      management: indicator.management,
      evaluator: indicator.evaluator,
      periodicity: indicator.periodicity,
      level: indicator.level,
      unit: indicator.unit,
      strategy: indicator.strategy ?? "",
      status: indicator.status,
      deficientGoal: String(indicator.deficientGoal),
      acceptableGoal: String(indicator.acceptableGoal),
      objectiveGoal: String(indicator.objectiveGoal),
      variableNames: Array.from({ length: 8 }, (_, index) => indicator.variableNames[index] || `Variable ${index + 1}`),
    });
    setMessage(null);
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      processId: processes[0]?.id ?? "",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/indicators", {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });

      const payload = (await response.json()) as {
        message?: string;
        indicator?: IndicatorSummary;
      };

      if (!response.ok || !payload.indicator) {
        throw new Error(payload.message || "No fue posible guardar el indicador.");
      }

      if (editingId) {
        setIndicators((current) =>
          current.map((indicator) =>
            indicator.id === editingId ? payload.indicator! : indicator,
          ),
        );
        setMessage("Indicador actualizado correctamente.");
      } else {
        setIndicators((current) => [...current, payload.indicator!]);
        setMessage("Indicador creado correctamente.");
      }

      resetForm();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible guardar el indicador.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff4ff_0%,#f7fbff_45%,#eef4e8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminNavigation
          currentPath="/admin/indicadores"
          title="Gestion de indicadores"
          description="Administra metas, variables y estado de cada indicador desde una navegacion central mas clara."
        />

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(25,50,80,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  {editingId ? "Editar indicador" : "Crear indicador"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Define datos principales, metas y variables.
                </p>
              </div>
              {editingId ? (
                <button
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  onClick={resetForm}
                  type="button"
                >
                  Cancelar edicion
                </button>
              ) : null}
            </div>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Codigo" required>
                  <input className="field" value={form.code} onChange={(event) => setField("code", event.target.value)} required />
                </Field>
                <Field label="Nombre" required>
                  <input className="field" value={form.name} onChange={(event) => setField("name", event.target.value)} required />
                </Field>
                <Field label="Proceso" required>
                  <select className="field" value={form.processId} onChange={(event) => setField("processId", event.target.value)} required>
                    <option value="">Selecciona un proceso</option>
                    {processes.map((process) => (
                      <option key={process.id} value={process.id}>{process.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Estado" required>
                  <select className="field" value={form.status} onChange={(event) => setField("status", event.target.value)}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </Field>
                <Field label="Gerencia" required>
                  <input className="field" value={form.management} onChange={(event) => setField("management", event.target.value)} required />
                </Field>
                <Field label="Responsable de evaluacion" required>
                  <input className="field" value={form.evaluator} onChange={(event) => setField("evaluator", event.target.value)} required />
                </Field>
                <Field label="Periodicidad" required>
                  <input className="field" value={form.periodicity} onChange={(event) => setField("periodicity", event.target.value)} required />
                </Field>
                <Field label="Nivel" required>
                  <input className="field" value={form.level} onChange={(event) => setField("level", event.target.value)} required />
                </Field>
                <Field label="Unidad de medida" required>
                  <input className="field" value={form.unit} onChange={(event) => setField("unit", event.target.value)} required />
                </Field>
                <Field label="Estrategia">
                  <input className="field" value={form.strategy} onChange={(event) => setField("strategy", event.target.value)} />
                </Field>
                <Field label="Meta deficiente" required>
                  <input className="field" type="number" step="0.01" value={form.deficientGoal} onChange={(event) => setField("deficientGoal", event.target.value)} required />
                </Field>
                <Field label="Meta aceptable" required>
                  <input className="field" type="number" step="0.01" value={form.acceptableGoal} onChange={(event) => setField("acceptableGoal", event.target.value)} required />
                </Field>
                <Field label="Meta objetiva" required>
                  <input className="field" type="number" step="0.01" value={form.objectiveGoal} onChange={(event) => setField("objectiveGoal", event.target.value)} required />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {form.variableNames.map((variableName, index) => (
                  <Field key={index} label={`Variable ${index + 1}`}>
                    <input className="field" value={variableName} onChange={(event) => setVariable(index, event.target.value)} />
                  </Field>
                ))}
              </div>

              {message ? <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
              {error ? <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

              <button
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={saving || loading}
                type="submit"
              >
                {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear indicador"}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(25,50,80,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Indicadores registrados</h2>
                <p className="mt-2 text-sm text-slate-500">Listado de indicadores actuales.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {indicators.length} indicadores
              </span>
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-slate-500">Cargando indicadores...</p>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-4">Codigo</th>
                      <th className="px-4">Indicador</th>
                      <th className="px-4">Proceso</th>
                      <th className="px-4">Estado</th>
                      <th className="px-4">Actualizado</th>
                      <th className="px-4">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicators.map((indicator) => (
                      <tr key={indicator.id} className="rounded-2xl bg-slate-50 text-sm text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                        <td className="rounded-l-2xl px-4 py-4 font-semibold text-slate-950">{indicator.code}</td>
                        <td className="px-4 py-4">{indicator.name}</td>
                        <td className="px-4 py-4">{indicator.processName}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${indicator.status === "Activo" ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-700"}`}>
                            {indicator.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">{new Date(indicator.updatedAt).toLocaleString("es-CO")}</td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <button
                            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                            onClick={() => startEdit(indicator)}
                            type="button"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function Field({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>
        {label} {required ? <span className="text-rose-600">*</span> : null}
      </span>
      {children}
    </label>
  );
}
