/* legacy page content hidden during migration
"use client";

import { FormEvent, useState } from "react";
import { indicatorTemplates } from "@/lib/mock-indicators";
import ConnectedFormPage from "@/app/_components/connected-form-page";

const justifications = [
  "N/A",
  "No se presentaron requerimientos",
  "Meta objetivo 0",
  "Falta de gestión",
];

type FormValues = {
  process: string;
  indicatorId: string;
  reportingDate: string;
  startDate: string;
  endDate: string;
  periodMonths: string;
  variableValues: string[];
  result: string;
  indicatorPercentage: string;
  compliance: string;
  zeroJustification: string;
  analysis: string;
  observation: string;
};

const initialFormValues: FormValues = {
  process: "",
  indicatorId: "",
  reportingDate: "",
  startDate: "",
  endDate: "",
  periodMonths: "",
  variableValues: Array.from({ length: 8 }, () => ""),
  result: "",
  indicatorPercentage: "",
  compliance: "",
  zeroJustification: "N/A",
  analysis: "",
  observation: "",
};

function Home() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [confirmationId, setConfirmationId] = useState("");

  const processes = Array.from(
    new Set(indicatorTemplates.map((indicator) => indicator.process)),
  );
  const indicatorsForProcess = indicatorTemplates.filter(
    (indicator) => indicator.process === formValues.process,
  );
  const selectedIndicator = indicatorTemplates.find(
    (indicator) => indicator.id === formValues.indicatorId,
  );

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function updateVariableValue(index: number, value: string) {
    setFormValues((current) => {
      const nextValues = [...current.variableValues];
      nextValues[index] = value;

      return {
        ...current,
        variableValues: nextValues,
      };
    });
  }

  function resetForm() {
    setFormValues(initialFormValues);
    setConfirmationId("");
  }

  function handleProcessChange(nextProcess: string) {
    setConfirmationId("");
    setFormValues({
      ...initialFormValues,
      process: nextProcess,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const generatedId = `IND-${new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    setConfirmationId(generatedId);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff4ff_0%,#f7fbff_45%,#eef4e8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_30px_80px_rgba(20,38,62,0.12)] backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="inline-flex rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-900">
              Simulación del formulario de indicadores
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950">
              Recreación inicial del formulario de tablero de mando con Next.js
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              Esta primera versión imita el flujo de la app original: selección
              de proceso, carga de indicadores, diligenciamiento de resultados y
              confirmación con ID de registro.
            </p>
          </div>

          <div className="grid gap-3 rounded-[1.5rem] bg-slate-950 p-5 text-slate-50">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Objetivo del proyecto
            </p>
            <p className="text-sm leading-6 text-slate-300">
              Construir una aplicación web conectada a PostgreSQL donde
              diferentes personas consulten indicadores y reporten sus resultados
              mediante formularios.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <StatCard label="Frontend" value="Next.js" />
              <StatCard label="Base de datos" value="PostgreSQL" />
              <StatCard label="Estado actual" value="Simulación" />
              <StatCard label="Siguiente fase" value="Persistencia real" />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <form
            className="space-y-6 rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(25,50,80,0.08)]"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  Formulario de resultados
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Los campos cambian según el indicador seleccionado.
                </p>
              </div>
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                type="button"
                onClick={resetForm}
              >
                Limpiar formulario
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Proceso" required>
                <select
                  className="field"
                  value={formValues.process}
                  onChange={(event) => handleProcessChange(event.target.value)}
                  required
                >
                  <option value="">Selecciona un proceso</option>
                  {processes.map((process) => (
                    <option key={process} value={process}>
                      {process}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Indicador" required>
                <select
                  className="field"
                  value={formValues.indicatorId}
                  onChange={(event) =>
                    updateField("indicatorId", event.target.value)
                  }
                  required
                  disabled={!formValues.process}
                >
                  <option value="">Selecciona un indicador</option>
                  {indicatorsForProcess.map((indicator) => (
                    <option key={indicator.id} value={indicator.id}>
                      {indicator.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <ReadOnlyField
                label="Gerencia"
                value={selectedIndicator?.management ?? ""}
              />
              <ReadOnlyField
                label="Responsable de evaluación"
                value={selectedIndicator?.evaluator ?? ""}
              />
              <ReadOnlyField
                label="Periodicidad"
                value={selectedIndicator?.periodicity ?? ""}
              />
              <ReadOnlyField
                label="Nivel del indicador"
                value={selectedIndicator?.level ?? ""}
              />
              <ReadOnlyField
                label="Unidad de medida"
                value={selectedIndicator?.unit ?? ""}
              />
              <ReadOnlyField
                label="Estrategia"
                value={selectedIndicator?.strategy ?? ""}
              />
            </div>

            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Fechas del reporte
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <Field label="Fecha de diligenciamiento" required>
                  <input
                    className="field"
                    type="date"
                    value={formValues.reportingDate}
                    onChange={(event) =>
                      updateField("reportingDate", event.target.value)
                    }
                    required
                  />
                </Field>

                <Field label="Fecha de inicio" required>
                  <input
                    className="field"
                    type="date"
                    value={formValues.startDate}
                    onChange={(event) =>
                      updateField("startDate", event.target.value)
                    }
                    required
                  />
                </Field>

                <Field label="Fecha de fin" required>
                  <input
                    className="field"
                    type="date"
                    value={formValues.endDate}
                    onChange={(event) =>
                      updateField("endDate", event.target.value)
                    }
                    required
                  />
                </Field>

                <Field label="Periodo en meses" required>
                  <input
                    className="field"
                    type="number"
                    min="1"
                    value={formValues.periodMonths}
                    onChange={(event) =>
                      updateField("periodMonths", event.target.value)
                    }
                    required
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-slate-50">
              <h3 className="text-lg font-semibold">Metas configuradas</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <GoalCard
                  label="Meta deficiente"
                  value={selectedIndicator?.deficientGoal}
                />
                <GoalCard
                  label="Meta aceptable"
                  value={selectedIndicator?.acceptableGoal}
                />
                <GoalCard
                  label="Meta objetiva"
                  value={selectedIndicator?.objectiveGoal}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-[1.5rem] bg-teal-50 p-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Variables del indicador
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  En la versión final estos nombres vendrán directamente desde
                  PostgreSQL según el indicador.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 8 }, (_, index) => {
                  const label =
                    selectedIndicator?.variableNames[index] ??
                    `Variable ${index + 1}`;

                  return (
                    <Field key={label} label={label}>
                      <input
                        className="field"
                        type="number"
                        min="0"
                        placeholder={`Ingresa ${label.toLowerCase()}`}
                        value={formValues.variableValues[index]}
                        onChange={(event) =>
                          updateVariableValue(index, event.target.value)
                        }
                      />
                    </Field>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Resultado del indicador" required>
                <input
                  className="field"
                  type="number"
                  step="0.01"
                  value={formValues.result}
                  onChange={(event) => updateField("result", event.target.value)}
                  required
                />
              </Field>

              <Field label="% indicador" required>
                <input
                  className="field"
                  type="number"
                  step="0.01"
                  value={formValues.indicatorPercentage}
                  onChange={(event) =>
                    updateField("indicatorPercentage", event.target.value)
                  }
                  required
                />
              </Field>

              <Field label="¿Cumple?" required>
                <select
                  className="field"
                  value={formValues.compliance}
                  onChange={(event) =>
                    updateField("compliance", event.target.value)
                  }
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                  <option value="Parcial">Parcial</option>
                </select>
              </Field>

              <Field label="Justificación variables en 0">
                <select
                  className="field"
                  value={formValues.zeroJustification}
                  onChange={(event) =>
                    updateField("zeroJustification", event.target.value)
                  }
                >
                  {justifications.map((justification) => (
                    <option key={justification} value={justification}>
                      {justification}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4">
              <Field label="Análisis del indicador" required>
                <textarea
                  className="field min-h-32 resize-y"
                  placeholder="Explica el comportamiento del indicador, hallazgos y acciones."
                  value={formValues.analysis}
                  onChange={(event) =>
                    updateField("analysis", event.target.value)
                  }
                  required
                />
              </Field>

              <Field label="Observación">
                <textarea
                  className="field min-h-24 resize-y"
                  placeholder="Agrega observaciones adicionales si aplica."
                  value={formValues.observation}
                  onChange={(event) =>
                    updateField("observation", event.target.value)
                  }
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500">
                Esta versión todavía no guarda en base de datos; simula el flujo
                de captura y confirmación.
              </p>
              <button
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                type="submit"
              >
                Enviar formulario
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6 shadow-[0_16px_40px_rgba(21,94,117,0.10)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-900">
                Flujo actual
              </p>
              <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
                <li>1. El usuario selecciona un proceso.</li>
                <li>2. El sistema filtra los indicadores disponibles.</li>
                <li>3. Se cargan metas, variables y metadatos del indicador.</li>
                <li>4. El usuario reporta el resultado y su análisis.</li>
                <li>5. La app genera un ID de confirmación.</li>
              </ol>
            </section>

            <section className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-[0_16px_40px_rgba(20,83,45,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
                Confirmación
              </p>
              {confirmationId ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-[1.5rem] bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-900">
                      Registro generado correctamente.
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-950">
                      {confirmationId}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    En la siguiente fase este ID saldrá del registro real
                    almacenado en PostgreSQL.
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Aquí aparecerá el número de radicado cuando envíes el
                  formulario.
                </p>
              )}
            </section>

            <section className="rounded-[2rem] bg-slate-950 p-6 text-slate-50 shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
                Siguiente construcción
              </p>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">
                <p>1. Crear la base de datos y las tablas en PostgreSQL.</p>
                <p>2. Conectar Next.js con Prisma.</p>
                <p>3. Reemplazar datos simulados por datos reales.</p>
                <p>4. Guardar el envío del formulario en la base.</p>
              </div>
            </section>
          </aside>
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">
        {value || "Se completa al elegir un indicador"}
      </p>
    </div>
  );
}

function GoalCard({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="rounded-[1.25rem] bg-white/10 p-4 ring-1 ring-white/15">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">
        {value ?? "--"}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white/8 p-3 ring-1 ring-white/10">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default ConnectedFormPage;
*/

import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { canSubmit } from "@/lib/roles";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (canSubmit(session.role)) {
    redirect("/formulario");
  }

  redirect("/sin-acceso");
}
