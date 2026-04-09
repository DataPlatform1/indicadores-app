"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BRANDING } from "@/lib/branding";
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
    <main className="brand-page px-4 py-8">
      <div className="mx-auto grid min-h-[80vh] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="brand-panel rounded-[2rem] p-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="brand-logo-mark">
              {BRANDING.assets.logoText || BRANDING.shortName}
            </span>
            <div className="space-y-1">
              <p className="brand-kicker">{BRANDING.appEyebrow}</p>
              <p className="text-sm font-semibold text-slate-700">
                {BRANDING.organizationName}
              </p>
            </div>
          </div>

          <p className="brand-badge mt-6">{BRANDING.loginBadge}</p>
          <h1 className="brand-title mt-5 max-w-3xl text-4xl font-semibold tracking-tight">
            {BRANDING.loginTitle}
          </h1>
          <p className="brand-copy mt-4 max-w-2xl text-base leading-7">
            {BRANDING.loginDescription}
          </p>

          <div className="brand-panel-soft mt-8 rounded-[1.75rem] p-6">
            <p className="brand-kicker">{BRANDING.loginSupportTitle}</p>
            <p className="brand-copy mt-3 text-sm leading-7">
              {BRANDING.loginSupportText}
            </p>
            <div className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
              <div className="rounded-[1.25rem] bg-white/80 p-4">
                <p className="brand-kicker">Donde se cambia</p>
                <p className="mt-2 font-semibold text-slate-900">src/lib/branding.ts</p>
              </div>
              <div className="rounded-[1.25rem] bg-white/80 p-4">
                <p className="brand-kicker">Que controlas</p>
                <p className="mt-2 font-semibold text-slate-900">
                  colores, textos, tipografias y logo
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="brand-panel rounded-[2rem] p-8">
          <h2 className="brand-title text-2xl font-semibold">Ingresar</h2>
          <p className="brand-copy mt-2 text-sm">
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
              className="brand-button-primary px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-slate-400"
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
