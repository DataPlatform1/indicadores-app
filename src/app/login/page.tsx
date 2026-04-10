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
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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
    <main className="brand-page px-4 py-8">
      <div className="mx-auto grid min-h-[80vh] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="brand-panel rounded-[2rem] p-8">
          <div className="flex flex-wrap items-center gap-4">
            {branding.assets.logoImageUrl ? (
              <img
                alt={`${branding.organizationName} logo`}
                className="h-14 w-14 rounded-full object-cover shadow-[0_16px_32px_rgba(15,23,42,0.18)]"
                src={branding.assets.logoImageUrl}
              />
            ) : (
              <span className="brand-logo-mark">
                {branding.assets.logoText || branding.shortName}
              </span>
            )}
            <div className="space-y-1">
              <p className="brand-kicker">{branding.appEyebrow}</p>
              <p className="text-sm font-semibold text-slate-700">
                {branding.organizationName}
              </p>
            </div>
          </div>

          <p className="brand-badge mt-6">{branding.loginBadge}</p>
          <h1 className="brand-title mt-5 max-w-3xl text-4xl font-semibold tracking-tight">
            {branding.loginTitle}
          </h1>
          <p className="brand-copy mt-4 max-w-2xl text-base leading-7">
            {branding.loginDescription}
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.92fr]">
            <div className="brand-panel-soft rounded-[1.75rem] p-6">
              <p className="brand-kicker">{branding.loginSupportTitle}</p>
              <p className="brand-copy mt-3 text-sm leading-7">
                {branding.loginSupportText}
              </p>
              <div className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                <div className="rounded-[1.25rem] bg-white/80 p-4">
                  <p className="brand-kicker">Donde se cambia</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    Panel administrativo de diseno
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-white/80 p-4">
                  <p className="brand-kicker">Que controlas</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    colores, textos, imagenes y logo
                  </p>
                </div>
              </div>
            </div>

            {branding.assets.loginImageUrl ? (
              <div className="brand-panel-soft overflow-hidden rounded-[1.75rem] p-3">
                <img
                  alt={`${branding.organizationName} portada`}
                  className="h-full min-h-64 w-full rounded-[1.25rem] object-cover"
                  src={branding.assets.loginImageUrl}
                />
              </div>
            ) : (
              <div className="brand-panel-soft rounded-[1.75rem] p-6">
                <p className="brand-kicker">Vista institucional</p>
                <h3 className="brand-title mt-3 text-2xl font-semibold">
                  {branding.appTitle}
                </h3>
                <p className="brand-copy mt-3 text-sm leading-7">
                  {branding.appSummary}
                </p>
              </div>
            )}
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
