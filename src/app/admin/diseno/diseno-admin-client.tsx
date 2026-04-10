"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminNavigation from "@/app/_components/admin-navigation";

type BrandingForm = {
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
  logoText: string;
  loginImageUrl: string;
  logoImageUrl: string;
};

const emptyForm: BrandingForm = {
  organizationName: "",
  shortName: "",
  appTitle: "",
  appDescription: "",
  appEyebrow: "",
  appSummary: "",
  loginBadge: "",
  loginTitle: "",
  loginDescription: "",
  loginSupportTitle: "",
  loginSupportText: "",
  background: "",
  panelBackground: "",
  panelBorder: "",
  mutedSurface: "",
  primary: "",
  primaryHover: "",
  secondary: "",
  accent: "",
  accentText: "",
  text: "",
  mutedText: "",
  inputBorder: "",
  inputFocus: "",
  inputDisabled: "",
  cardShadow: "",
  logoText: "",
  loginImageUrl: "",
  logoImageUrl: "",
};

export default function DisenoAdminClient() {
  const [form, setForm] = useState<BrandingForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBranding() {
      try {
        const response = await fetch("/api/branding", {
          cache: "no-store",
          credentials: "include",
        });
        const payload = (await response.json()) as {
          message?: string;
          settings?: Partial<BrandingForm> | null;
          defaults?: {
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
            assets: {
              logoText: string;
              loginImageUrl: string;
              logoImageUrl: string;
            };
          };
        };

        if (!response.ok || !payload.defaults) {
          throw new Error(payload.message || "No fue posible cargar la configuracion visual.");
        }

        const defaults = payload.defaults;
        const settings = payload.settings;

        setForm({
          organizationName: settings?.organizationName ?? defaults.organizationName,
          shortName: settings?.shortName ?? defaults.shortName,
          appTitle: settings?.appTitle ?? defaults.appTitle,
          appDescription: settings?.appDescription ?? defaults.appDescription,
          appEyebrow: settings?.appEyebrow ?? defaults.appEyebrow,
          appSummary: settings?.appSummary ?? defaults.appSummary,
          loginBadge: settings?.loginBadge ?? defaults.loginBadge,
          loginTitle: settings?.loginTitle ?? defaults.loginTitle,
          loginDescription: settings?.loginDescription ?? defaults.loginDescription,
          loginSupportTitle:
            settings?.loginSupportTitle ?? defaults.loginSupportTitle,
          loginSupportText: settings?.loginSupportText ?? defaults.loginSupportText,
          background: settings?.background ?? defaults.visualStyle.background,
          panelBackground:
            settings?.panelBackground ?? defaults.visualStyle.panelBackground,
          panelBorder: settings?.panelBorder ?? defaults.visualStyle.panelBorder,
          mutedSurface:
            settings?.mutedSurface ?? defaults.visualStyle.mutedSurface,
          primary: settings?.primary ?? defaults.visualStyle.primary,
          primaryHover: settings?.primaryHover ?? defaults.visualStyle.primaryHover,
          secondary: settings?.secondary ?? defaults.visualStyle.secondary,
          accent: settings?.accent ?? defaults.visualStyle.accent,
          accentText: settings?.accentText ?? defaults.visualStyle.accentText,
          text: settings?.text ?? defaults.visualStyle.text,
          mutedText: settings?.mutedText ?? defaults.visualStyle.mutedText,
          inputBorder: settings?.inputBorder ?? defaults.visualStyle.inputBorder,
          inputFocus: settings?.inputFocus ?? defaults.visualStyle.inputFocus,
          inputDisabled:
            settings?.inputDisabled ?? defaults.visualStyle.inputDisabled,
          cardShadow: settings?.cardShadow ?? defaults.visualStyle.cardShadow,
          logoText: settings?.logoText ?? defaults.assets.logoText,
          loginImageUrl:
            settings?.loginImageUrl ?? defaults.assets.loginImageUrl ?? "",
          logoImageUrl: settings?.logoImageUrl ?? defaults.assets.logoImageUrl ?? "",
        });
      } catch (requestError) {
        console.error(requestError);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible cargar la configuracion visual.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadBranding();
  }, []);

  function updateField<K extends keyof BrandingForm>(field: K, value: BrandingForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/branding", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "No fue posible guardar el diseno.");
      }

      setMessage("Configuracion visual actualizada correctamente.");
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible guardar el diseno.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="brand-page px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminNavigation
          currentPath="/admin/diseno"
          title="Gestion de diseno"
          description="Cambia identidad visual, textos y branding desde un panel mas limpio y conectado con el resto del admin."
        />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="brand-panel rounded-[2rem] p-6" onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <SectionTitle
                title="Identidad institucional"
                description="Nombre, resumen y textos principales de la aplicacion."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombre de la organizacion" required>
                  <input className="field" value={form.organizationName} onChange={(event) => updateField("organizationName", event.target.value)} required />
                </Field>
                <Field label="Nombre corto" required>
                  <input className="field" value={form.shortName} onChange={(event) => updateField("shortName", event.target.value)} required />
                </Field>
                <Field label="Titulo de la app" required>
                  <input className="field" value={form.appTitle} onChange={(event) => updateField("appTitle", event.target.value)} required />
                </Field>
                <Field label="Resumen de la app" required>
                  <input className="field" value={form.appSummary} onChange={(event) => updateField("appSummary", event.target.value)} required />
                </Field>
                <Field label="Descripcion general" required>
                  <textarea className="field min-h-24 resize-y" value={form.appDescription} onChange={(event) => updateField("appDescription", event.target.value)} required />
                </Field>
                <Field label="Texto corto superior" required>
                  <input className="field" value={form.appEyebrow} onChange={(event) => updateField("appEyebrow", event.target.value)} required />
                </Field>
              </div>

              <SectionTitle
                title="Textos del login"
                description="Mensajes que ven los usuarios antes de iniciar sesion."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Badge del login" required>
                  <input className="field" value={form.loginBadge} onChange={(event) => updateField("loginBadge", event.target.value)} required />
                </Field>
                <Field label="Titulo del login" required>
                  <input className="field" value={form.loginTitle} onChange={(event) => updateField("loginTitle", event.target.value)} required />
                </Field>
                <Field label="Descripcion del login" required>
                  <textarea className="field min-h-24 resize-y" value={form.loginDescription} onChange={(event) => updateField("loginDescription", event.target.value)} required />
                </Field>
                <Field label="Titulo de apoyo" required>
                  <input className="field" value={form.loginSupportTitle} onChange={(event) => updateField("loginSupportTitle", event.target.value)} required />
                </Field>
                <Field label="Texto de apoyo" required>
                  <textarea className="field min-h-24 resize-y" value={form.loginSupportText} onChange={(event) => updateField("loginSupportText", event.target.value)} required />
                </Field>
                <Field label="Logo en texto" required>
                  <input className="field" value={form.logoText} onChange={(event) => updateField("logoText", event.target.value)} required />
                </Field>
                <Field label="URL imagen login">
                  <input className="field" value={form.loginImageUrl} onChange={(event) => updateField("loginImageUrl", event.target.value)} />
                </Field>
                <Field label="URL logo institucional">
                  <input className="field" value={form.logoImageUrl} onChange={(event) => updateField("logoImageUrl", event.target.value)} />
                </Field>
              </div>

              <SectionTitle
                title="Colores y superficie"
                description="Configura la apariencia general de toda la aplicacion."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Fondo principal" required>
                  <input className="field" value={form.background} onChange={(event) => updateField("background", event.target.value)} required />
                </Field>
                <Field label="Fondo de panel" required>
                  <input className="field" value={form.panelBackground} onChange={(event) => updateField("panelBackground", event.target.value)} required />
                </Field>
                <Field label="Borde de panel" required>
                  <input className="field" value={form.panelBorder} onChange={(event) => updateField("panelBorder", event.target.value)} required />
                </Field>
                <Field label="Superficie suave" required>
                  <input className="field" value={form.mutedSurface} onChange={(event) => updateField("mutedSurface", event.target.value)} required />
                </Field>
                <Field label="Color primario" required>
                  <input className="field" value={form.primary} onChange={(event) => updateField("primary", event.target.value)} required />
                </Field>
                <Field label="Primario hover" required>
                  <input className="field" value={form.primaryHover} onChange={(event) => updateField("primaryHover", event.target.value)} required />
                </Field>
                <Field label="Color secundario" required>
                  <input className="field" value={form.secondary} onChange={(event) => updateField("secondary", event.target.value)} required />
                </Field>
                <Field label="Color de acento" required>
                  <input className="field" value={form.accent} onChange={(event) => updateField("accent", event.target.value)} required />
                </Field>
                <Field label="Texto del acento" required>
                  <input className="field" value={form.accentText} onChange={(event) => updateField("accentText", event.target.value)} required />
                </Field>
                <Field label="Color del texto" required>
                  <input className="field" value={form.text} onChange={(event) => updateField("text", event.target.value)} required />
                </Field>
                <Field label="Texto secundario" required>
                  <input className="field" value={form.mutedText} onChange={(event) => updateField("mutedText", event.target.value)} required />
                </Field>
                <Field label="Borde de campos" required>
                  <input className="field" value={form.inputBorder} onChange={(event) => updateField("inputBorder", event.target.value)} required />
                </Field>
                <Field label="Foco de campos" required>
                  <input className="field" value={form.inputFocus} onChange={(event) => updateField("inputFocus", event.target.value)} required />
                </Field>
                <Field label="Fondo de campos deshabilitados" required>
                  <input className="field" value={form.inputDisabled} onChange={(event) => updateField("inputDisabled", event.target.value)} required />
                </Field>
                <Field label="Sombra principal" required>
                  <input className="field" value={form.cardShadow} onChange={(event) => updateField("cardShadow", event.target.value)} required />
                </Field>
              </div>

              {message ? (
                <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                className="brand-button-primary px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={saving || loading}
                type="submit"
              >
                {saving ? "Guardando..." : "Guardar configuracion visual"}
              </button>
            </div>
          </form>

          <section className="brand-panel rounded-[2rem] p-6">
            <SectionTitle
              title="Vista previa orientativa"
              description="Te ayuda a entender como impactaran los cambios antes de navegar por toda la app."
            />

            {loading ? (
              <p className="brand-copy mt-4 text-sm">Cargando configuracion visual...</p>
            ) : (
              <div className="mt-6 space-y-5">
                <div
                  className="rounded-[1.75rem] p-6"
                  style={{
                    background: form.background,
                    boxShadow: form.cardShadow,
                  }}
                >
                  <div
                    className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full text-sm font-extrabold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${form.primary}, ${form.secondary})`,
                    }}
                  >
                    {form.logoText}
                  </div>
                  <p
                    className="mt-4 inline-flex rounded-full px-4 py-1 text-sm font-semibold"
                    style={{
                      background: form.accent,
                      color: form.accentText,
                    }}
                  >
                    {form.loginBadge}
                  </p>
                  <h3 className="mt-4 text-3xl font-semibold" style={{ color: form.text }}>
                    {form.loginTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-6" style={{ color: form.mutedText }}>
                    {form.loginDescription}
                  </p>
                </div>

                <div
                  className="rounded-[1.5rem] p-5"
                  style={{
                    background: form.panelBackground,
                    border: `1px solid ${form.panelBorder}`,
                    boxShadow: form.cardShadow,
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: form.text }}>
                    Boton principal
                  </p>
                  <button
                    className="mt-4 rounded-full px-5 py-3 text-sm font-semibold text-white"
                    style={{ background: form.primary }}
                    type="button"
                  >
                    Iniciar sesion
                  </button>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="brand-title text-2xl font-semibold">{title}</h2>
      <p className="brand-copy mt-2 text-sm leading-6">{description}</p>
    </div>
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
