/* eslint-disable @typescript-eslint/no-require-imports */
const { randomBytes, scryptSync } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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

  await prisma.user.upsert({
    where: { email: "visor@indicadores.local" },
    update: {
      name: "Visor de Indicadores",
      role: "VIEWER",
      passwordHash: hashPassword("Viewer123*"),
    },
    create: {
      name: "Visor de Indicadores",
      email: "visor@indicadores.local",
      role: "VIEWER",
      passwordHash: hashPassword("Viewer123*"),
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
  console.log("correo: visor@indicadores.local");
  console.log("clave: Viewer123*");
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
