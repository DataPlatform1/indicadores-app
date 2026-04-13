export const BRANDING = {
  organizationName: "Indicadores App",
  shortName: "SEAPTO",
  appTitle: "Tablero de indicadores",
  appDescription: "Formulario de indicadores organizacionales con Next.js",
  appEyebrow: "GanaGana",
  appSummary:
    "Aplicacion para administrar usuarios, indicadores y resultados del tablero de mando.",
  loginBadge: "Acceso al sistema",
  loginTitle: "Formulario Indicadores",
  loginDescription:
    "Esta pantalla esta separada del formulario para que el acceso sea mas claro y profesional.",
  loginSupportTitle: "Configuracion visual centralizada",
  loginSupportText:
    "Los colores, fuentes, nombre institucional y recursos visuales se controlan desde un solo archivo de configuracion.",
  visualStyle: {
    background:
      "radial-gradient(circle at top, #e0f2fe 0%, #f8fafc 44%, #eef6e8 100%)",
    panelBackground: "rgba(255,255,255,0.88)",
    panelBorder: "rgba(255,255,255,0.76)",
    mutedSurface: "rgba(248,250,252,0.92)",
    primary: "#0f172a",
    primaryHover: "#1e293b",
    secondary: "#0f766e",
    accent: "#c8f2e9",
    accentText: "#115e59",
    text: "#0f172a",
    mutedText: "#475569",
    inputBorder: "#cbd5e1",
    inputFocus: "#0f766e",
    inputDisabled: "#e2e8f0",
    cardShadow: "0 30px 80px rgba(20, 38, 62, 0.12)",
  },
  fonts: {
    sansVar: "--font-manrope",
    displayVar: "--font-fraunces",
    monoVar: "--font-geist-mono",
  },
  assets: {
    logoText: "SEAPTO",
    loginImageUrl: "",
    logoImageUrl: "",
  },
} as const;
