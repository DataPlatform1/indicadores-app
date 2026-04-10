import { AuditAction, AuditEntity, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import AdminNavigation from "@/app/_components/admin-navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/roles";

function actionLabel(action: AuditAction) {
  switch (action) {
    case "CREATE":
      return "Creacion";
    case "UPDATE":
      return "Actualizacion";
    case "SUBMIT":
      return "Envio";
    case "LOGIN":
      return "Inicio de sesion";
    case "LOGOUT":
      return "Cierre de sesion";
    default:
      return action;
  }
}

function entityLabel(entity: AuditEntity) {
  switch (entity) {
    case "USER":
      return "Usuarios";
    case "INDICATOR":
      return "Indicadores";
    case "BRANDING":
      return "Diseno";
    case "RESULT":
      return "Resultados";
    case "AUTH":
      return "Acceso";
    default:
      return entity;
  }
}

function getMetadataNotes(metadata: Prisma.JsonValue | null) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return [] as string[];
  }

  const record = metadata as Record<string, Prisma.JsonValue>;
  const notes: string[] = [];

  if (Array.isArray(record.changedFields) && record.changedFields.length > 0) {
    notes.push(`Campos modificados: ${record.changedFields.join(", ")}`);
  }

  if (typeof record.recordNumber === "string") {
    notes.push(`Radicado: ${record.recordNumber}`);
  }

  if (typeof record.compliance === "string") {
    notes.push(`Cumplimiento: ${record.compliance}`);
  }

  if (typeof record.processName === "string") {
    notes.push(`Proceso: ${record.processName}`);
  }

  if (typeof record.status === "string") {
    notes.push(`Estado: ${record.status}`);
  }

  if (typeof record.passwordChanged === "boolean" && record.passwordChanged) {
    notes.push("Se actualizo la contrasena.");
  }

  return notes;
}

export default async function AdminAuditoriaPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageUsers(session.role)) {
    redirect("/sin-acceso");
  }

  let logs:
    | Awaited<ReturnType<typeof prisma.auditLog.findMany>>
    | null = null;
  let loadError: string | null = null;

  try {
    logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  } catch {
    loadError =
      "La bitacora aun no esta disponible. Normalmente esto pasa cuando falta aplicar la migracion nueva en Railway.";
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff4ff_0%,#f7fbff_45%,#eef4e8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminNavigation
          currentPath="/admin/auditoria"
          title="Auditoria y trazabilidad"
          description="Consulta accesos, cambios y movimientos clave del sistema desde una vista centralizada."
        />

        <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(25,50,80,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                Bitacora reciente
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Se muestran los 100 eventos mas recientes registrados por el sistema.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {logs?.length ?? 0} eventos
            </span>
          </div>

          {loadError ? (
            <div className="mt-6 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {loadError}
            </div>
          ) : null}

          {!loadError && logs?.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-sm text-slate-500">
              Aun no hay eventos de auditoria registrados.
            </div>
          ) : null}

          {!loadError && logs && logs.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {logs.map((log) => {
                const notes = getMetadataNotes(log.metadata);

                return (
                  <article
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                    key={log.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                            {entityLabel(log.entityType)}
                          </span>
                          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-900">
                            {actionLabel(log.action)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">
                            {log.summary}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            Objetivo: {log.targetName || "No especificado"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[1.25rem] bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                        <p>
                          <span className="font-semibold text-slate-900">Fecha:</span>{" "}
                          {new Date(log.createdAt).toLocaleString("es-CO")}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold text-slate-900">Usuario:</span>{" "}
                          {log.actorName || "Sistema"} {log.actorEmail ? `(${log.actorEmail})` : ""}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold text-slate-900">Rol:</span>{" "}
                          {log.actorRole || "N/A"}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold text-slate-900">IP:</span>{" "}
                          {log.ipAddress || "No disponible"}
                        </p>
                      </div>
                    </div>

                    {notes.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {notes.map((note) => (
                          <span
                            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                            key={note}
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
