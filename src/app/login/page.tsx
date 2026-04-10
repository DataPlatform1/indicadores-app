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

const PREMIUM_POINTS = [
  "Acceso limpio y directo para que el usuario entre sin friccion.",
  "Permisos, formulario y modulos administrativos bajo una sola sesion.",
  "Infraestructura preparada para trazabilidad y operacion institucional.",
];

const PLATFORM_CHIPS = ["Next.js", "Prisma", "PostgreSQL"];

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
    <main className="brand-page login-shell login-shell-premium px-4 py-4 lg:px-6">
      <div className="login-stage mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center">
        <div className="login-premium-grid w-full gap-5">
          <section className="brand-panel login-showcase rounded-[2rem] p-6 lg:p-8">
            <div className="login-showcase-orb login-showcase-orb-a" />
            <div className="login-showcase-orb login-showcase-orb-b" />

            <div className="login-showcase-inner">
              <div className="login-showcase-top">
                <div className="login-identity login-identity-premium">
                  {branding.assets.logoImageUrl ? (
                    <img
                      alt={`${branding.organizationName} logo`}
                      className="h-14 w-14 rounded-[1.25rem] object-cover shadow-[0_18px_38px_rgba(15,23,42,0.16)]"
                      src={branding.assets.logoImageUrl}
                    />
                  ) : (
                    <span className="brand-logo-mark h-14 w-14 rounded-[1.25rem] text-lg">
                      {branding.assets.logoText || branding.shortName}
                    </span>
                  )}

                  <div className="space-y-1">
                    <p className="brand-kicker">{branding.appEyebrow}</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {branding.organizationName}
                    </p>
                  </div>
                </div>

                <span className="brand-badge">{branding.loginBadge}</span>
              </div>

              <div className="login-showcase-copy">
                <h1 className="brand-title max-w-xl text-[clamp(2.8rem,5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                  {branding.loginTitle}
                </h1>
                <p className="brand-copy max-w-lg text-[1.02rem] leading-8">
                  {branding.loginDescription}
                </p>
              </div>

              <div className="login-points">
                {PREMIUM_POINTS.map((point) => (
                  <div className="login-point" key={point}>
                    <span className="login-point-marker" />
                    <p>{point}</p>
                  </div>
                ))}
              </div>

              <div className="login-bottom-strip">
                <div className="login-bottom-card">
                  <p className="brand-kicker">{branding.loginSupportTitle}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {branding.loginSupportText}
                  </p>
                </div>

                <div className="login-bottom-card login-bottom-card-dark">
                  <p className="brand-kicker text-cyan-300">Plataforma</p>
                  <h2 className="brand-title mt-3 text-2xl font-semibold text-white">
                    {branding.appTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {branding.appSummary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {PLATFORM_CHIPS.map((chip) => (
                      <span className="login-tech-chip" key={chip}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="brand-panel login-access rounded-[2rem] p-5 sm:p-6 lg:p-7">
            <div className="login-access-card">
              <div className="login-access-head">
                <div>
                  <p className="brand-kicker">Acceso seguro</p>
                  <h2 className="brand-title mt-3 text-[2.45rem] font-semibold leading-[1.02]">
                    Ingresar al sistema
                  </h2>
                  <p className="brand-copy mt-3 max-w-sm text-sm leading-7">
                    Usa tu correo y contrasena para entrar al formulario y a los
                    modulos habilitados segun tu rol.
                  </p>
                </div>

                <div className="login-system-chip">
                  <span className="login-secure-dot" />
                  <span>Sesion institucional</span>
                </div>
              </div>

              <form className="mt-7 grid gap-4" onSubmit={handleLogin}>
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
                      className="login-password-toggle"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </label>

                <div className="login-form-row">
                  <label className="inline-flex items-center gap-3 text-sm text-slate-600">
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
                  <div className="rounded-[1.1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {loginError}
                  </div>
                ) : null}

                <button
                  className="brand-button-primary login-submit-button mt-1 px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={isLoggingIn}
                  type="submit"
                >
                  <span>{isLoggingIn ? "Ingresando..." : "Iniciar sesion"}</span>
                  <span aria-hidden="true" className="login-submit-arrow">
                    →
                  </span>
                </button>
              </form>

              <div className="login-support-band mt-6">
                <div>
                  <p className="brand-kicker">Acceso por rol</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    El sistema habilita captura, historial y modulos administrativos
                    segun el perfil del usuario.
                  </p>
                </div>
                <div className="login-support-divider" />
                <div>
                  <p className="brand-kicker">Entorno productivo</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Operacion sobre PostgreSQL con trazabilidad activa para la capa
                    administrativa.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
