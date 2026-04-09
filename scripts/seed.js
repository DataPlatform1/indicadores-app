/* eslint-disable @typescript-eslint/no-require-imports */
const { randomBytes, scryptSync } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_BRANDING = {
  organizationName: "Indicadores App",
  shortName: "IA",
  appTitle: "Tablero de indicadores",
  appDescription: "Formulario de indicadores organizacionales con Next.js",
  appEyebrow: "Sistema institucional",
  appSummary:
    "Aplicacion para administrar usuarios, indicadores y resultados del tablero de mando.",
  loginBadge: "Acceso al sistema",
  loginTitle: "Inicia sesion para acceder el formulario de indicadores",
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
  assets: {
    logoText: "IA",
    loginImageUrl: "",
    logoImageUrl: "",
  },
};

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

const indicatorTemplates = [
  {
    code: "IND-GH-001",
    process: "Gestión Humana",
    description: "Indicadores relacionados con formación, desarrollo y talento.",
    name: "Cumplimiento del plan de capacitación",
    management: "Gerencia de Talento",
    evaluator: "Líder de Desarrollo",
    periodicity: "Mensual",
    level: "Estratégico",
    unit: "Porcentaje",
    strategy: "Fortalecer competencias internas",
    status: "Activo",
    deficientGoal: "60.00",
    acceptableGoal: "80.00",
    objectiveGoal: "95.00",
    variableNames: [
      "Capacitaciones programadas",
      "Capacitaciones ejecutadas",
      "Colaboradores convocados",
      "Colaboradores asistentes",
      "Horas planificadas",
      "Horas ejecutadas",
      "Presupuesto asignado",
      "Presupuesto ejecutado",
    ],
  },
  {
    code: "IND-OP-002",
    process: "Operaciones",
    description: "Indicadores relacionados con disciplina y cumplimiento operativo.",
    name: "Cumplimiento del cronograma operativo",
    management: "Gerencia de Operaciones",
    evaluator: "Coordinador Operativo",
    periodicity: "Mensual",
    level: "Táctico",
    unit: "Porcentaje",
    strategy: "Mejorar disciplina operativa",
    status: "Activo",
    deficientGoal: "70.00",
    acceptableGoal: "85.00",
    objectiveGoal: "97.00",
    variableNames: [
      "Actividades programadas",
      "Actividades ejecutadas",
      "Incidencias registradas",
      "Incidencias resueltas",
      "Equipos disponibles",
      "Equipos intervenidos",
      "OT planificadas",
      "OT cerradas",
    ],
  },
  {
    code: "IND-CM-003",
    process: "Comercial",
    description: "Indicadores asociados al desempeño de conversión comercial.",
    name: "Efectividad de conversión comercial",
    management: "Gerencia Comercial",
    evaluator: "Jefe Comercial",
    periodicity: "Mensual",
    level: "Estratégico",
    unit: "Porcentaje",
    strategy: "Incrementar cierres efectivos",
    status: "Activo",
    deficientGoal: "20.00",
    acceptableGoal: "35.00",
    objectiveGoal: "50.00",
    variableNames: [
      "Prospectos recibidos",
      "Propuestas enviadas",
      "Negocios cerrados",
      "Clientes nuevos",
      "Ingresos proyectados",
      "Ingresos reales",
      "Seguimientos realizados",
      "Seguimientos efectivos",
    ],
  },
];

async function main() {
  await prisma.brandSettings.upsert({
    where: { id: "default" },
    update: {
      organizationName: DEFAULT_BRANDING.organizationName,
      shortName: DEFAULT_BRANDING.shortName,
      appTitle: DEFAULT_BRANDING.appTitle,
      appDescription: DEFAULT_BRANDING.appDescription,
      appEyebrow: DEFAULT_BRANDING.appEyebrow,
      appSummary: DEFAULT_BRANDING.appSummary,
      loginBadge: DEFAULT_BRANDING.loginBadge,
      loginTitle: DEFAULT_BRANDING.loginTitle,
      loginDescription: DEFAULT_BRANDING.loginDescription,
      loginSupportTitle: DEFAULT_BRANDING.loginSupportTitle,
      loginSupportText: DEFAULT_BRANDING.loginSupportText,
      background: DEFAULT_BRANDING.visualStyle.background,
      panelBackground: DEFAULT_BRANDING.visualStyle.panelBackground,
      panelBorder: DEFAULT_BRANDING.visualStyle.panelBorder,
      mutedSurface: DEFAULT_BRANDING.visualStyle.mutedSurface,
      primary: DEFAULT_BRANDING.visualStyle.primary,
      primaryHover: DEFAULT_BRANDING.visualStyle.primaryHover,
      secondary: DEFAULT_BRANDING.visualStyle.secondary,
      accent: DEFAULT_BRANDING.visualStyle.accent,
      accentText: DEFAULT_BRANDING.visualStyle.accentText,
      text: DEFAULT_BRANDING.visualStyle.text,
      mutedText: DEFAULT_BRANDING.visualStyle.mutedText,
      inputBorder: DEFAULT_BRANDING.visualStyle.inputBorder,
      inputFocus: DEFAULT_BRANDING.visualStyle.inputFocus,
      inputDisabled: DEFAULT_BRANDING.visualStyle.inputDisabled,
      cardShadow: DEFAULT_BRANDING.visualStyle.cardShadow,
      logoText: DEFAULT_BRANDING.assets.logoText,
      loginImageUrl: DEFAULT_BRANDING.assets.loginImageUrl || null,
      logoImageUrl: DEFAULT_BRANDING.assets.logoImageUrl || null,
    },
    create: {
      id: "default",
      organizationName: DEFAULT_BRANDING.organizationName,
      shortName: DEFAULT_BRANDING.shortName,
      appTitle: DEFAULT_BRANDING.appTitle,
      appDescription: DEFAULT_BRANDING.appDescription,
      appEyebrow: DEFAULT_BRANDING.appEyebrow,
      appSummary: DEFAULT_BRANDING.appSummary,
      loginBadge: DEFAULT_BRANDING.loginBadge,
      loginTitle: DEFAULT_BRANDING.loginTitle,
      loginDescription: DEFAULT_BRANDING.loginDescription,
      loginSupportTitle: DEFAULT_BRANDING.loginSupportTitle,
      loginSupportText: DEFAULT_BRANDING.loginSupportText,
      background: DEFAULT_BRANDING.visualStyle.background,
      panelBackground: DEFAULT_BRANDING.visualStyle.panelBackground,
      panelBorder: DEFAULT_BRANDING.visualStyle.panelBorder,
      mutedSurface: DEFAULT_BRANDING.visualStyle.mutedSurface,
      primary: DEFAULT_BRANDING.visualStyle.primary,
      primaryHover: DEFAULT_BRANDING.visualStyle.primaryHover,
      secondary: DEFAULT_BRANDING.visualStyle.secondary,
      accent: DEFAULT_BRANDING.visualStyle.accent,
      accentText: DEFAULT_BRANDING.visualStyle.accentText,
      text: DEFAULT_BRANDING.visualStyle.text,
      mutedText: DEFAULT_BRANDING.visualStyle.mutedText,
      inputBorder: DEFAULT_BRANDING.visualStyle.inputBorder,
      inputFocus: DEFAULT_BRANDING.visualStyle.inputFocus,
      inputDisabled: DEFAULT_BRANDING.visualStyle.inputDisabled,
      cardShadow: DEFAULT_BRANDING.visualStyle.cardShadow,
      logoText: DEFAULT_BRANDING.assets.logoText,
      loginImageUrl: DEFAULT_BRANDING.assets.loginImageUrl || null,
      logoImageUrl: DEFAULT_BRANDING.assets.logoImageUrl || null,
    },
  });

  await prisma.user.deleteMany({
    where: { email: "visor@indicadores.local" },
  });

  await prisma.user.upsert({
    where: { email: "admin@indicadores.local" },
    update: {
      name: "Administrador General",
      role: "ADMIN",
      passwordHash: hashPassword("Admin123*"),
    },
    create: {
      name: "Administrador General",
      email: "admin@indicadores.local",
      role: "ADMIN",
      passwordHash: hashPassword("Admin123*"),
    },
  });

  await prisma.user.upsert({
    where: { email: "editor@indicadores.local" },
    update: {
      name: "Editor de Indicadores",
      role: "EDITOR",
      passwordHash: hashPassword("Editor123*"),
    },
    create: {
      name: "Editor de Indicadores",
      email: "editor@indicadores.local",
      role: "EDITOR",
      passwordHash: hashPassword("Editor123*"),
    },
  });

  for (const template of indicatorTemplates) {
    const process = await prisma.process.upsert({
      where: { name: template.process },
      update: {
        description: template.description,
      },
      create: {
        name: template.process,
        description: template.description,
      },
    });

    const indicator = await prisma.indicator.upsert({
      where: { code: template.code },
      update: {
        name: template.name,
        management: template.management,
        evaluator: template.evaluator,
        periodicity: template.periodicity,
        level: template.level,
        unit: template.unit,
        strategy: template.strategy,
        status: template.status,
        deficientGoal: template.deficientGoal,
        acceptableGoal: template.acceptableGoal,
        objectiveGoal: template.objectiveGoal,
        processId: process.id,
      },
      create: {
        code: template.code,
        name: template.name,
        management: template.management,
        evaluator: template.evaluator,
        periodicity: template.periodicity,
        level: template.level,
        unit: template.unit,
        strategy: template.strategy,
        status: template.status,
        deficientGoal: template.deficientGoal,
        acceptableGoal: template.acceptableGoal,
        objectiveGoal: template.objectiveGoal,
        processId: process.id,
      },
    });

    for (const [index, name] of template.variableNames.entries()) {
      await prisma.indicatorVariable.upsert({
        where: {
          indicatorId_sortOrder: {
            indicatorId: indicator.id,
            sortOrder: index + 1,
          },
        },
        update: {
          name,
        },
        create: {
          name,
          sortOrder: index + 1,
          indicatorId: indicator.id,
        },
      });
    }
  }

  console.log("Usuario inicial:");
  console.log("correo: admin@indicadores.local");
  console.log("clave: Admin123*");
  console.log("correo: editor@indicadores.local");
  console.log("clave: Editor123*");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Base sembrada correctamente.");
  })
  .catch(async (error) => {
    console.error("Error al sembrar la base:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

