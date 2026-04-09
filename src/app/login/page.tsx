"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { canSubmit } from "@/lib/roles";

type SessionUser = {
  userId: string;
  email: string;
  role: string;
  name: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        authenticated: boolean;
        user: SessionUser | null;
      };

      if (!payload.user) {
        return;
      }

      if (canSubmit(payload.user.role)) {
        router.replace("/formulario");
        return;
      }

      router.replace("/sin-acceso");
    }

    loadSession();
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const payload = (await response.json()) as {
        message?: string;
        user?: SessionUser;
      };

      if (!response.ok || !payload.user) {
        throw new Error(payload.message || "No fue posible iniciar sesion.");
      }

      if (canSubmit(payload.user.role)) {
        window.location.assign("/formulario");
        return;
      }

      window.location.assign("/sin-acceso");
    } catch (error) {
      console.error(error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "Ocurrio un error al iniciar sesion.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff4ff_0%,#f7fbff_45%,#eef4e8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto grid min-h-[80vh] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_80px_rgba(20,38,62,0.12)] backdrop-blur">
          <p className="inline-flex rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-900">
            Acceso al sistema actualizado
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950">
            Inicia sesion para acceder el formulario de indicadores
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Esta pantalla esta separada del formulario para que el acceso sea mas claro y profesional.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_20px_60px_rgba(25,50,80,0.08)]">
          <h2 className="text-2xl font-semibold text-slate-950">Ingresar</h2>
          <p className="mt-2 text-sm text-slate-500">
            Usa tu correo y contrasena para acceder.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Correo</span>
              <input
                className="field"
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Contrasena</span>
              <input
                className="field"
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                required
              />
            </label>

            {loginError ? (
              <p className="text-sm text-rose-600">{loginError}</p>
            ) : null}

            <button
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isLoggingIn}
              type="submit"
            >
              {isLoggingIn ? "Ingresando..." : "Iniciar sesion"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
