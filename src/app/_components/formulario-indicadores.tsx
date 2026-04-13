"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { canManageUsers, canSubmit, canViewHistory } from "@/lib/roles";

const justifications = [
  "N/A",
  "No se presentaron requerimientos",
  "Meta objetivo 0",
  "Falta de gestion",
];

const MAX_VARIABLES = 4;

type IndicatorTemplate = {
  id: string;
  code: string;
  process: string;
  name: string;
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
  variableIds: string[];
};

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

type SessionUser = {
  userId: string;
  email: string;
  role: string;
  name: string;
};

const initialFormValues: FormValues = {
  process: "",
  indicatorId: "",
  reportingDate: "",
  startDate: "",
  endDate: "",
  periodMonths: "",
  variableValues: Array.from({ length: MAX_VARIABLES }, () => ""),
  result: "",
  indicatorPercentage: "",
  compliance: "",
  zeroJustification: "N/A",
  analysis: "",
  observation: "",
};

export default function FormularioIndicadores() {
  const router = useRouter();
  const [indicatorTemplates, setIndicatorTemplates] = useState<IndicatorTemplate[]>([]);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [recentResults, setRecentResults] = useState<ResultSummary[]>([]);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const response = await fetch("/api/form-template");
        if (!response.ok) {
          throw new Error("No fue posible cargar la plantilla del formulario.");
        }

        const payload = (await response.json()) as {
          indicators: IndicatorTemplate[];
        };

        setIndicatorTemplates(payload.indicators);
      } catch (error) {
        console.error(error);
        setFeedback("No fue posible cargar los indicadores desde la base de datos.");
      } finally {
        setIsLoadingTemplate(false);
      }
    }

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error("No fue posible validar la sesion.");
        }

        const payload = (await response.json()) as {
          authenticated: boolean;
          user: SessionUser | null;
        };

        setSessionUser(payload.user);
      } catch (error) {
        console.error(error);
      } finally {
        setSessionChecked(true);
      }
    }

    loadTemplate();
    loadSession();
  }, []);

  useEffect(() => {
    if (sessionChecked && !sessionUser) {
      router.replace("/login");
    }
  }, [router, sessionChecked, sessionUser]);

  useEffect(() => {
    if (!sessionUser || !canViewHistory(sessionUser.role)) {
      setRecentResults([]);
      return;
    }

    async function loadRecentResults() {
      try {
        const response = await fetch("/api/results");
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          results: ResultSummary[];
        };

        setRecentResults(payload.results);
      } catch (error) {
        console.error(error);
      }
    }

    loadRecentResults();
  }, [sessionUser]);

  const processes = useMemo(
    () => Array.from(new Set(indicatorTemplates.map((indicator) => indicator.process))),
    [indicatorTemplates],
  );

  const indicatorsForProcess = indicatorTemplates.filter(
    (indicator) => indicator.process === formValues.process,
  );

  const selectedIndicator = indicatorTemplates.find(
    (indicator) => indicator.id === formValues.indicatorId,
  );
  const visibleVariableNames = Array.from(
    { length: MAX_VARIABLES },
    (_, index) => selectedIndicator?.variableNames[index] ?? `Variable ${index + 1}`,
  );

  const canCurrentUserSubmit = canSubmit(sessionUser?.role);
  const canCurrentUserViewHistory = canViewHistory(sessionUser?.role);
  const canCurrentUserManageUsers = canManageUsers(sessionUser?.role);
  const dateRangeError =
    formValues.startDate &&
    formValues.endDate &&
    new Date(formValues.startDate) > new Date(formValues.endDate)
      ? "La fecha de inicio no puede ser mayor a la fecha de fin."
      : null;

  useEffect(() => {
    setFormValues((current) => {
      const nextPeriodMonths = calculatePeriodMonths(
        current.startDate,
        current.endDate,
      );
      const nextResult = calculateIndicatorResult(
        selectedIndicator?.variableNames ?? [],
        current.variableValues,
      );
      const nextResultValue = nextResult === null ? "" : formatNumber(nextResult);
      const nextCompliance =
        nextResult === null || !selectedIndicator
          ? ""
          : calculateCompliance(nextResult, selectedIndicator);

      if (
        current.periodMonths === nextPeriodMonths &&
        current.result === nextResultValue &&
        current.indicatorPercentage === nextResultValue &&
        current.compliance === nextCompliance
      ) {
        return current;
      }

      return {
        ...current,
        periodMonths: nextPeriodMonths,
        result: nextResultValue,
        indicatorPercentage: nextResultValue,
        compliance: nextCompliance,
      };
    });
  }, [selectedIndicator, formValues.startDate, formValues.endDate, formValues.variableValues]);

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

  function handleIndicatorChange(indicatorId: string) {
    setFormValues((current) => ({
      ...current,
      indicatorId,
      variableValues: Array.from({ length: MAX_VARIABLES }, () => ""),
      result: "",
      indicatorPercentage: "",
      compliance: "",
      zeroJustification: "N/A",
    }));
  }

  function resetForm() {
    setFormValues(initialFormValues);
    setFeedback(null);
  }

  function handleProcessChange(nextProcess: string) {
    setFeedback(null);
    setFormValues({
      ...initialFormValues,
      process: nextProcess,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (dateRangeError) {
        throw new Error(dateRangeError);
      }

      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      const payload = (await response.json()) as {
        message?: string;
        recordNumber?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "No fue posible guardar el registro.");
      }

      router.push(
        `/formulario/exito?radicado=${encodeURIComponent(payload.recordNumber ?? "")}`,
      );
    } catch (error) {
      console.error(error);
      setFeedback(
        error instanceof Error ? error.message : "Ocurrio un error inesperado al guardar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!sessionChecked || !sessionUser) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff4ff_0%,#f7fbff_45%,#eef4e8_100%)] px-4 py-8 text-slate-900">
        <div className="mx-auto grid min-h-[80vh] max-w-4xl place-items-center">
          <section className="rounded-[2rem] border border-white/70 bg-white p-8 text-center shadow-[0_20px_60px_rgba(25,50,80,0.08)]">
            <p className="text-sm text-slate-500">Validando sesion...</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff4ff_0%,#f7fbff_45%,#eef4e8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(20,38,62,0.12)] backdrop-blur">
          <div className="space-y-4">
            <p className="inline-flex rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-900">
              Formulario de indicadores
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Formulario Indicadores
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {sessionUser.email} Â· Rol: {sessionUser.role}
            </p>
          </div>

          <div className="hidden gap-3 rounded-[1.5rem] bg-slate-950 p-5 text-slate-50">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Usuario actual
            </p>
            <p className="text-sm leading-6 text-slate-300">
              {sessionUser.name} ({sessionUser.email})
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <StatCard label="Rol" value={sessionUser.role} />
              <StatCard label="Base de datos" value="PostgreSQL" />
              <StatCard label="Frontend" value="Next.js" />
              <StatCard label="Acceso" value={canCurrentUserSubmit ? "Edicion" : "Consulta"} />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white p-4 shadow-[0_20px_60px_rgba(25,50,80,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="hidden">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                Sesion iniciada
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {sessionUser.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {sessionUser.email} · Rol: {sessionUser.role}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {canCurrentUserSubmit
                  ? "Puede diligenciar formularios."
                  : "No tiene permiso para diligenciar formularios."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {canCurrentUserManageUsers ? (
                <Link
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  href="/admin/indicadores"
                >
                  Administrar indicadores
                </Link>
              ) : null}
              {canCurrentUserManageUsers ? (
                <Link
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  href="/admin/diseno"
                >
                  Administrar diseno
                </Link>
              ) : null}
              {canCurrentUserManageUsers ? (
                <Link
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  href="/admin/usuarios"
                >
                  Administrar usuarios
                </Link>
              ) : null}
              {canCurrentUserManageUsers ? (
                <Link
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  href="/admin/auditoria"
                >
                  Ver auditoria
                </Link>
              ) : null}
              {canCurrentUserViewHistory ? (
                <Link
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  href="/registros"
                >
                  Ver historial completo
                </Link>
              ) : null}
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                onClick={handleLogout}
                type="button"
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        </section>

        <section>
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
                  Los campos cambian segun el indicador seleccionado y se cargan desde
                  PostgreSQL.
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

            {!canCurrentUserSubmit ? (
              <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Tu rol no tiene permiso para enviar formularios.
              </div>
            ) : null}

            {feedback ? (
              <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {feedback}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Proceso" required>
                <select
                  className="field"
                  value={formValues.process}
                  onChange={(event) => handleProcessChange(event.target.value)}
                  required
                  disabled={isLoadingTemplate || !canCurrentUserSubmit}
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
                  onChange={(event) => handleIndicatorChange(event.target.value)}
                  required
                  disabled={!formValues.process || isLoadingTemplate || !canCurrentUserSubmit}
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
              <ReadOnlyField label="Gerencia" value={selectedIndicator?.management ?? ""} />
              <ReadOnlyField
                label="Responsable de evaluacion"
                value={selectedIndicator?.evaluator ?? ""}
              />
              <ReadOnlyField label="Periodicidad" value={selectedIndicator?.periodicity ?? ""} />
              <ReadOnlyField label="Nivel del indicador" value={selectedIndicator?.level ?? ""} />
              <ReadOnlyField label="Unidad de medida" value={selectedIndicator?.unit ?? ""} />
              <ReadOnlyField label="Estrategia" value={selectedIndicator?.strategy ?? ""} />
            </div>

            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">Fechas del reporte</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <Field label="Fecha de diligenciamiento" required>
                  <input
                    className="field"
                    type="date"
                    value={formValues.reportingDate}
                    onChange={(event) => updateField("reportingDate", event.target.value)}
                    required
                    disabled={!canCurrentUserSubmit}
                  />
                </Field>

                <Field label="Fecha de inicio" required>
                  <input
                    className="field"
                    type="date"
                    value={formValues.startDate}
                    onChange={(event) => updateField("startDate", event.target.value)}
                    max={formValues.endDate || undefined}
                    required
                    disabled={!canCurrentUserSubmit}
                  />
                </Field>

                <Field label="Fecha de fin" required>
                  <input
                    className="field"
                    type="date"
                    value={formValues.endDate}
                    onChange={(event) => updateField("endDate", event.target.value)}
                    min={formValues.startDate || undefined}
                    required
                    disabled={!canCurrentUserSubmit}
                  />
                </Field>

                <Field label="Periodo en meses" required>
                  <input
                    className="field"
                    type="number"
                    min="0"
                    value={formValues.periodMonths}
                    readOnly
                    required
                    disabled={!canCurrentUserSubmit || !formValues.startDate || !formValues.endDate}
                  />
                </Field>
              </div>
              {dateRangeError ? (
                <p className="mt-3 text-sm font-medium text-rose-600">
                  {dateRangeError}
                </p>
              ) : null}
            </div>

            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-slate-50">
              <h3 className="text-lg font-semibold">Metas configuradas</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <GoalCard label="Meta deficiente" value={selectedIndicator?.deficientGoal} />
                <GoalCard label="Meta aceptable" value={selectedIndicator?.acceptableGoal} />
                <GoalCard label="Meta objetiva" value={selectedIndicator?.objectiveGoal} />
              </div>
            </div>

            <div className="space-y-4 rounded-[1.5rem] bg-teal-50 p-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Variables del indicador</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Estos nombres vienen de la base de datos segun el indicador seleccionado.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {visibleVariableNames.map((label, index) => {
                  return (
                    <Field key={label} label={label}>
                      <input
                        className="field"
                        type="number"
                        min="0"
                        placeholder={`Ingresa ${label.toLowerCase()}`}
                        value={formValues.variableValues[index]}
                        onChange={(event) => updateVariableValue(index, event.target.value)}
                        disabled={!canCurrentUserSubmit || !selectedIndicator}
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
                  readOnly
                  required
                  disabled={!canCurrentUserSubmit || !selectedIndicator}
                />
              </Field>

              <Field label="% indicador" required>
                <input
                  className="field"
                  type="number"
                  step="0.01"
                  value={formValues.indicatorPercentage}
                  readOnly
                  required
                  disabled={!canCurrentUserSubmit || !selectedIndicator}
                />
              </Field>

              <Field label="Cumple" required>
                <input
                  className="field"
                  value={formValues.compliance}
                  readOnly
                  required
                  disabled={!canCurrentUserSubmit || !selectedIndicator}
                  placeholder="Se calcula con las metas configuradas"
                />
              </Field>

              <div className="hidden">
                <Field label="Justificacion variables en 0">
                  <select
                    className="field"
                    value={formValues.zeroJustification}
                    onChange={(event) => updateField("zeroJustification", event.target.value)}
                    disabled={!canCurrentUserSubmit}
                  >
                    {justifications.map((justification) => (
                      <option key={justification} value={justification}>
                        {justification}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            <div className="grid gap-4">
              <Field label="Analisis del indicador" required>
                <textarea
                  className="field min-h-32 resize-y"
                  placeholder="Explica el comportamiento del indicador, hallazgos y acciones."
                  value={formValues.analysis}
                  onChange={(event) => updateField("analysis", event.target.value)}
                  required
                  disabled={!canCurrentUserSubmit}
                />
              </Field>

              <Field label="Observacion">
                <textarea
                  className="field min-h-24 resize-y"
                  placeholder="Agrega observaciones adicionales si aplica."
                  value={formValues.observation}
                  onChange={(event) => updateField("observation", event.target.value)}
                  disabled={!canCurrentUserSubmit}
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500">
                Al enviar, se guardara en PostgreSQL y se mostrara una pantalla final.
              </p>
              <button
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                type="submit"
                disabled={isSubmitting || isLoadingTemplate || !canCurrentUserSubmit}
              >
                {isSubmitting ? "Guardando..." : "Enviar formulario"}
              </button>
            </div>
          </form>

          <aside className="hidden">
            <section className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6 shadow-[0_16px_40px_rgba(21,94,117,0.10)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-900">
                Flujo actual
              </p>
              <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
                <li>1. El usuario inicia sesion.</li>
                <li>2. El sistema valida el rol.</li>
                <li>3. Se cargan indicadores y metadatos desde PostgreSQL.</li>
                <li>4. El usuario diligencia el formulario.</li>
                <li>5. El sistema redirige a una pantalla final de confirmacion.</li>
              </ol>
            </section>

            <section className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-[0_16px_40px_rgba(20,83,45,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
                Acceso por rol
              </p>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
                <p>ADMIN: diligencia formularios y consulta registros recientes.</p>
                <p>EDITOR: diligencia formularios, sin acceso al historial.</p>
                <p>Usuarios no registrados: sin acceso al formulario.</p>
              </div>
            </section>

            {canCurrentUserViewHistory ? (
              <section className="rounded-[2rem] bg-slate-950 p-6 text-slate-50 shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
                  Registros recientes
                </p>
                <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">
                  <p>Solo el administrador puede ver este resumen rapido.</p>
                </div>

                <Link
                  className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                  href="/registros"
                >
                  Ver historial completo
                </Link>
              </section>
            ) : null}
          </aside>
        </section>

        {canCurrentUserViewHistory ? (
          <section className="hidden rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(25,50,80,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Registros recientes</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ultimos formularios guardados en PostgreSQL.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {recentResults.length} visibles
              </span>
            </div>

            {recentResults.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                Aun no hay resultados guardados para mostrar.
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto">
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
                    </tr>
                  </thead>
                  <tbody>
                    {recentResults.map((result) => (
                      <tr
                        key={result.id}
                        className="rounded-2xl bg-slate-50 text-sm text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                      >
                        <td className="rounded-l-2xl px-4 py-4 font-semibold text-slate-950">
                          {result.recordNumber}
                        </td>
                        <td className="px-4 py-4">{result.process}</td>
                        <td className="px-4 py-4">{result.indicator}</td>
                        <td className="px-4 py-4">{result.submittedBy || "Sin usuario"}</td>
                        <td className="px-4 py-4">{result.resultValue}</td>
                        <td className="px-4 py-4">{result.indicatorPercent}</td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                            {result.compliance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
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

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
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
      <p className="mt-2 text-3xl font-semibold text-white">{value ?? "--"}</p>
    </div>
  );
}

function parseNumericValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function safeDivide(numerator: number, denominator: number) {
  if (!Number.isFinite(denominator) || denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

function formatNumber(value: number) {
  return String(Math.round(value * 100) / 100);
}

function calculatePeriodMonths(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return "";
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return "";
  }

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  return String(Math.max(months, 0));
}

function findVariableValue(
  variableNames: string[],
  values: (number | null)[],
  patterns: string[],
) {
  const index = variableNames.findIndex((name) => {
    const normalized = name.toLowerCase();
    return patterns.some((pattern) => normalized.includes(pattern));
  });

  return index >= 0 ? values[index] : null;
}

function calculateIndicatorResult(variableNames: string[], variableValues: string[]) {
  const names = variableNames.slice(0, MAX_VARIABLES);
  const values = variableValues
    .slice(0, MAX_VARIABLES)
    .map((value) => parseNumericValue(value));
  const filledValues = values.filter((value): value is number => value !== null);

  if (filledValues.length === 0) {
    return null;
  }

  const ingresos = findVariableValue(names, values, ["ingreso", "venta"]);
  const costos = findVariableValue(names, values, ["costo"]);

  if (ingresos !== null && costos !== null) {
    const margin = safeDivide(ingresos - costos, ingresos);
    return margin === null ? null : margin * 100;
  }

  const programadas = findVariableValue(names, values, ["programad", "planificad"]);
  const ejecutadas = findVariableValue(names, values, ["ejecutad", "realizad", "cerrad"]);

  if (programadas !== null && ejecutadas !== null) {
    const ratio = safeDivide(ejecutadas, programadas);
    return ratio === null ? null : ratio * 100;
  }

  const propuestas = findVariableValue(names, values, ["propuesta"]);
  const negocios = findVariableValue(names, values, ["negocio", "cierre", "cerrad"]);

  if (propuestas !== null && negocios !== null) {
    const conversion = safeDivide(negocios, propuestas);
    return conversion === null ? null : conversion * 100;
  }

  const first = values[0];
  const second = values[1];

  if (filledValues.length >= 2 && first !== null && second !== null) {
    const ratio = safeDivide(second, first);
    return ratio === null ? null : ratio * 100;
  }

  return filledValues[0];
}

function calculateCompliance(result: number, indicator: IndicatorTemplate) {
  const deficient = indicator.deficientGoal;
  const acceptable = indicator.acceptableGoal;
  const objective = indicator.objectiveGoal;
  const lowerIsBetter = objective <= acceptable && acceptable <= deficient;

  if (lowerIsBetter) {
    if (result <= objective) {
      return "Objetiva";
    }

    if (result <= acceptable) {
      return "Aceptable";
    }

    return "Deficiente";
  }

  if (result >= objective) {
    return "Objetiva";
  }

  if (result >= acceptable) {
    return "Aceptable";
  }

  return "Deficiente";
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white/8 p-3 ring-1 ring-white/10">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

