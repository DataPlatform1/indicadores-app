"use client";

import { FormEvent, Fragment, useEffect, useState } from "react";
import Link from "next/link";

type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "EDITOR" as UserSummary["role"],
};

export default function UsuariosAdminClient() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    password: "",
    role: "EDITOR" as UserSummary["role"],
    isActive: true,
  });

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch("/api/users", {
          cache: "no-store",
          credentials: "include",
        });

        const payload = (await response.json()) as {
          message?: string;
          users?: UserSummary[];
        };

        if (!response.ok) {
          throw new Error(payload.message || "No fue posible cargar usuarios.");
        }

        setUsers(payload.users ?? []);
      } catch (requestError) {
        console.error(requestError);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible cargar usuarios.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        message?: string;
        user?: UserSummary;
      };

      if (!response.ok || !payload.user) {
        throw new Error(payload.message || "No fue posible crear el usuario.");
      }

      setUsers((current) => [payload.user!, ...current]);
      setForm(initialForm);
      setFeedback("Usuario creado correctamente.");
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible crear el usuario.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function startEditingUser(user: UserSummary) {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setFeedback(null);
    setError(null);
  }

  function cancelEditingUser() {
    setEditingUserId(null);
    setEditForm({
      name: "",
      password: "",
      role: "EDITOR",
      isActive: true,
    });
  }

  async function handleUpdateUser(userId: string) {
    setIsUpdating(userId);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          name: editForm.name,
          password: editForm.password || undefined,
          role: editForm.role,
          isActive: editForm.isActive,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        user?: UserSummary;
      };

      if (!response.ok || !payload.user) {
        throw new Error(payload.message || "No fue posible actualizar el usuario.");
      }

      setUsers((current) =>
        current.map((user) => (user.id === userId ? payload.user! : user)),
      );
      setFeedback("Usuario actualizado correctamente.");
      cancelEditingUser();
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible actualizar el usuario.",
      );
    } finally {
      setIsUpdating(null);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff4ff_0%,#f7fbff_45%,#eef4e8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_30px_80px_rgba(20,38,62,0.12)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-900">
                Panel administrativo
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Gestion de usuarios
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Desde aqui el administrador puede crear usuarios, actualizar roles y
                activar o desactivar accesos.
              </p>
            </div>

            <Link
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              href="/formulario"
            >
              Volver al formulario
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(25,50,80,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-950">Crear usuario</h2>
            <p className="mt-2 text-sm text-slate-500">
              Define nombre, correo, clave y rol.
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <Field label="Nombre" required>
                <input
                  className="field"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                />
              </Field>

              <Field label="Correo" required>
                <input
                  className="field"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </Field>

              <Field label="Contrasena" required>
                <input
                  className="field"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                />
              </Field>

              <Field label="Rol" required>
                <select
                  className="field"
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target.value as UserSummary["role"],
                    }))
                  }
                >
                  <option value="EDITOR">EDITOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </Field>

              {feedback ? (
                <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {feedback}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Guardando..." : "Crear usuario"}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(25,50,80,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Usuarios registrados</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Usuarios creados en la base de datos y su estado actual.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {users.length} usuarios
              </span>
            </div>

            {isLoading ? (
              <p className="mt-6 text-sm text-slate-500">Cargando usuarios...</p>
            ) : users.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">Aun no hay usuarios creados.</p>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-4">Nombre</th>
                      <th className="px-4">Correo</th>
                      <th className="px-4">Rol</th>
                      <th className="px-4">Estado</th>
                      <th className="px-4">Creado</th>
                      <th className="px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <Fragment key={user.id}>
                        <tr
                          className="rounded-2xl bg-slate-50 text-sm text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                        >
                          <td className="rounded-l-2xl px-4 py-4 font-semibold text-slate-950">
                            {user.name}
                          </td>
                          <td className="px-4 py-4">{user.email}</td>
                          <td className="px-4 py-4">{user.role}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                user.isActive
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {user.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {new Date(user.createdAt).toLocaleString("es-CO")}
                          </td>
                          <td className="rounded-r-2xl px-4 py-4">
                            <button
                              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                              onClick={() => startEditingUser(user)}
                              type="button"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>

                        {editingUserId === user.id ? (
                          <tr>
                            <td className="px-2 pt-2" colSpan={6}>
                              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <Field label="Nombre" required>
                                    <input
                                      className="field"
                                      type="text"
                                      value={editForm.name}
                                      onChange={(event) =>
                                        setEditForm((current) => ({
                                          ...current,
                                          name: event.target.value,
                                        }))
                                      }
                                      required
                                    />
                                  </Field>

                                  <Field label="Rol" required>
                                    <select
                                      className="field"
                                      value={editForm.role}
                                      onChange={(event) =>
                                        setEditForm((current) => ({
                                          ...current,
                                          role: event.target.value as UserSummary["role"],
                                        }))
                                      }
                                    >
                                      <option value="EDITOR">EDITOR</option>
                                      <option value="ADMIN">ADMIN</option>
                                    </select>
                                  </Field>

                                  <Field label="Nueva contrasena">
                                    <input
                                      className="field"
                                      type="password"
                                      placeholder="Opcional"
                                      value={editForm.password}
                                      onChange={(event) =>
                                        setEditForm((current) => ({
                                          ...current,
                                          password: event.target.value,
                                        }))
                                      }
                                    />
                                  </Field>

                                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                                    <span>Estado</span>
                                    <select
                                      className="field"
                                      value={editForm.isActive ? "ACTIVO" : "INACTIVO"}
                                      onChange={(event) =>
                                        setEditForm((current) => ({
                                          ...current,
                                          isActive: event.target.value === "ACTIVO",
                                        }))
                                      }
                                    >
                                      <option value="ACTIVO">Activo</option>
                                      <option value="INACTIVO">Inactivo</option>
                                    </select>
                                  </label>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                  <button
                                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                    disabled={isUpdating === user.id}
                                    onClick={() => handleUpdateUser(user.id)}
                                    type="button"
                                  >
                                    {isUpdating === user.id ? "Guardando..." : "Guardar cambios"}
                                  </button>
                                  <button
                                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                                    onClick={cancelEditingUser}
                                    type="button"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
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
