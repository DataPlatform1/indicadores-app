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

type BrandingViewModel = {
  organizationName: string;
  shortName: string;
  appTitle: string;
  appDescription: string;
  appEyebrow: string;
  appSummary: string;
  loginBadge: string;
  loginTitle: string;
  loginDescription: string;
  loginSupportTitle: string;
  loginSupportText: string;
  visualStyle: {
    background: string;
    panelBackground: string;
    panelBorder: string;
    mutedSurface: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    accentText: string;
    text: string;
    mutedText: string;
    inputBorder: string;
    inputFocus: string;
    inputDisabled: string;
    cardShadow: string;
  };
  fonts: {
    sansVar: string;
    displayVar: string;
    monoVar: string;
  };
  assets: {
    logoText: string;
    loginImageUrl: string;
    logoImageUrl: string;
  };
};

type BrandingPayload = {
  settings?: {
    organizationName?: string;
    shortName?: string;
    appTitle?: string;
    appDescription?: string;
    appEyebrow?: string;
    appSummary?: string;
    loginBadge?: string;
    loginTitle?: string;
    loginDescription?: string;
    loginSupportTitle?: string;
    loginSupportText?: string;
    background?: string;
    panelBackground?: string;
    panelBorder?: string;
    mutedSurface?: string;
    primary?: string;
    primaryHover?: string;
    secondary?: string;
    accent?: string;
    accentText?: string;
    text?: string;
    mutedText?: string;
    inputBorder?: string;
    inputFocus?: string;
    inputDisabled?: string;
    cardShadow?: string;
    logoText?: string;
    loginImageUrl?: string | null;
    logoImageUrl?: string | null;
  } | null;
};

function mergeBranding(payload: BrandingPayload): BrandingViewModel {
  const settings = payload.settings;

  if (!settings) {
    return BRANDING;
  }

  return {
    organizationName: settings.organizationName || BRANDING.organizationName,
    shortName: settings.shortName || BRANDING.shortName,
    appTitle: settings.appTitle || BRANDING.appTitle,
    appDescription: settings.appDescription || BRANDING.appDescription,
    appEyebrow: settings.appEyebrow || BRANDING.appEyebrow,
    appSummary: settings.appSummary || BRANDING.appSummary,
    loginBadge: settings.loginBadge || BRANDING.loginBadge,
    loginTitle: settings.loginTitle || BRANDING.loginTitle,
    loginDescription: settings.loginDescription || BRANDING.loginDescription,
    loginSupportTitle: settings.loginSupportTitle || BRANDING.loginSupportTitle,
    loginSupportText: settings.loginSupportText || BRANDING.loginSupportText,
    visualStyle: {
      background: settings.background || BRANDING.visualStyle.background,
      panelBackground:
        settings.panelBackground || BRANDING.visualStyle.panelBackground,
      panelBorder: settings.panelBorder || BRANDING.visualStyle.panelBorder,
      mutedSurface: settings.mutedSurface || BRANDING.visualStyle.mutedSurface,
      primary: settings.primary || BRANDING.visualStyle.primary,
      primaryHover: settings.primaryHover || BRANDING.visualStyle.primaryHover,
      secondary: settings.secondary || BRANDING.visualStyle.secondary,
      accent: settings.accent || BRANDING.visualStyle.accent,
      accentText: settings.accentText || BRANDING.visualStyle.accentText,
      text: settings.text || BRANDING.visualStyle.text,
      mutedText: settings.mutedText || BRANDING.visualStyle.mutedText,
      inputBorder: settings.inputBorder || BRANDING.visualStyle.inputBorder,
      inputFocus: settings.inputFocus || BRANDING.visualStyle.inputFocus,
      inputDisabled:
        settings.inputDisabled || BRANDING.visualStyle.inputDisabled,
      cardShadow: settings.cardShadow || BRANDING.visualStyle.cardShadow,
    },
    fonts: BRANDING.fonts,
    assets: {
      logoText: settings.logoText || BRANDING.assets.logoText,
      loginImageUrl: settings.loginImageUrl || BRANDING.assets.loginImageUrl,
      logoImageUrl: settings.logoImageUrl || BRANDING.assets.logoImageUrl,
    },
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [branding, setBranding] = useState<BrandingViewModel>({
    ...BRANDING,
    fonts: { ...BRANDING.fonts },
    visualStyle: { ...BRANDING.visualStyle },
    assets: { ...BRANDING.assets },
  });

  useEffect(() => {
    async function loadBranding() {
      try {
        const response = await fetch("/api/branding", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as BrandingPayload;
        setBranding(mergeBranding(payload));
      } catch (error) {
        console.error(error);
      }
    }

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

    loadBranding();
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
    <main className="brand-page login-shell flex items-center px-4 py-4 lg:px-6">
      <div className="login-grid mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-7xl items-center gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="brand-panel login-hero rounded-[2.15rem] p-7 lg:p-8">
          <div className="login-hero-mesh" />

          <div className="relative z-10">
            <div className="login-kicker-row">
              <div className="login-identity">
                {branding.assets.logoImageUrl ? (
                  <img
                    alt={`${branding.organizationName} logo`}
                    className="h-14 w-14 rounded-[1.2rem] object-cover shadow-[0_18px_38px_rgba(15,23,42,0.16)]"
                    src={branding.assets.logoImageUrl}
                  />
                ) : (
                  <span className="brand-logo-mark h-14 w-14 rounded-[1.2rem] text-lg">
                    {branding.assets.logoText || branding.shortName}
                  </span>
                )}
                <div className="space-y-1">
                  <p className="brand-kicker">{branding.appEyebrow}</p>
                  <p className="text-base font-semibold text-slate-800">
                    {branding.organizationName}
                  </p>
                </div>
              </div>

              <span className="brand-badge">{branding.loginBadge}</span>
            </div>

            <div className="mt-7 max-w-4xl">
              <h1 className="brand-title max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.035em] lg:text-5xl">
                {branding.loginTitle}
              </h1>
              <p className="brand-copy mt-4 max-w-2xl text-base leading-7">
                {branding.loginDescription}
              </p>
            </div>

            <div className="login-stat-grid mt-6">
              <StatCard label="Experiencia" value="Acceso claro" />
              <StatCard label="Gestion" value="Roles y control" />
              <StatCard label="Seguridad" value="Sesion protegida" />
            </div>

            <div className="login-feature-grid mt-6">
              <div className="login-feature-card">
                <p className="brand-kicker">{branding.loginSupportTitle}</p>
                <p className="brand-copy mt-3 text-sm leading-7">
                  {branding.loginSupportText}
                </p>

                <div className="login-mini-grid mt-4">
                  <div className="login-mini-card">
                    <p className="brand-kicker">Direccion visual</p>
                    <p className="mt-3 text-base font-semibold text-slate-900">
                      Identidad institucional con mejor jerarquia y menos sensacion
                      de plantilla.
                    </p>
                  </div>
                  <div className="login-mini-card">
                    <p className="brand-kicker">Control central</p>
                    <p className="mt-3 text-base font-semibold text-slate-900">
                      Textos, colores y recursos visuales se pueden administrar sin
                      rehacer la app.
                    </p>
                  </div>
                </div>
              </div>

              {branding.assets.loginImageUrl ? (
                <div className="login-feature-card overflow-hidden p-3">
                  <img
                    alt={`${branding.organizationName} portada`}
                    className="h-full min-h-60 w-full rounded-[1.3rem] object-cover"
                    src={branding.assets.loginImageUrl}
                  />
                </div>
              ) : (
                <div className="login-feature-card dark">
                  <p className="brand-kicker text-cyan-300">Vista institucional</p>
                  <h3 className="brand-title mt-3 text-2xl font-semibold text-white">
                    {branding.appTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {branding.appSummary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                      Next.js
                    </span>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                      Prisma
                    </span>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                      PostgreSQL
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="brand-panel login-card rounded-[2.15rem] p-7 lg:p-8">
          <div className="login-card-inner">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="brand-kicker">Acceso seguro</p>
                <h2 className="brand-title mt-3 text-[2.2rem] font-semibold leading-tight">
                  Ingresar al sistema
                </h2>
                <p className="brand-copy mt-3 max-w-md text-sm leading-7">
                  Usa tu correo y contrasena para continuar al formulario y a los
                  modulos segun tu rol.
                </p>
              </div>

              <div className="login-secure-note">
                <span className="login-secure-dot" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Sesion institucional
                </span>
              </div>
            </div>

            <div className="login-form-divider my-6" />

            <form className="grid gap-5" onSubmit={handleLogin}>
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
                <div className="relative">
                  <input
                    className="field pr-28"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    required
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="inline-flex items-center gap-3 text-slate-600">
                  <input
                    checked={loginForm.rememberMe}
                    className="h-4 w-4 rounded border-slate-300 text-slate-950 accent-slate-950"
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        rememberMe: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>Mantener sesion por mas tiempo</span>
                </label>

                <button
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                  onClick={() =>
                    setLoginError(
                      "Si olvidaste tu contrasena, contacta al administrador para restablecer el acceso.",
                    )
                  }
                  type="button"
                >
                  Olvide mi contrasena
                </button>
              </div>

              {loginError ? (
                <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {loginError}
                </div>
              ) : null}

              <button
                className="brand-button-primary mt-2 px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isLoggingIn}
                type="submit"
              >
                {isLoggingIn ? "Ingresando..." : "Iniciar sesion"}
              </button>
            </form>

            <div className="login-form-divider my-6" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] bg-white/80 p-4 ring-1 ring-slate-200/80">
                <p className="brand-kicker">Acceso por rol</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Los permisos de captura, historial y administracion cambian segun el
                  perfil del usuario.
                </p>
              </div>
              <div className="rounded-[1.4rem] bg-white/80 p-4 ring-1 ring-slate-200/80">
                <p className="brand-kicker">Entorno productivo</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  La app opera sobre PostgreSQL y mantiene trazabilidad en los modulos
                  administrativos.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="login-stat-card">
      <p className="login-stat-label">{label}</p>
      <p className="login-stat-value">{value}</p>
    </div>
  );
}
