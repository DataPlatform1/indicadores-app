export type IndicatorTemplate = {
  id: string;
  process: string;
  name: string;
  management: string;
  evaluator: string;
  periodicity: string;
  level: string;
  unit: string;
  strategy: string;
  status: string;
  deficientGoal: number;
  acceptableGoal: number;
  objectiveGoal: number;
  variableNames: string[];
};

export const indicatorTemplates: IndicatorTemplate[] = [
  {
    id: "IND-GH-001",
    process: "Gestión Humana",
    name: "Cumplimiento del plan de capacitación",
    management: "Gerencia de Talento",
    evaluator: "Líder de Desarrollo",
    periodicity: "Mensual",
    level: "Estratégico",
    unit: "Porcentaje",
    strategy: "Fortalecer competencias internas",
    status: "Activo",
    deficientGoal: 60,
    acceptableGoal: 80,
    objectiveGoal: 95,
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
    id: "IND-OP-002",
    process: "Operaciones",
    name: "Cumplimiento del cronograma operativo",
    management: "Gerencia de Operaciones",
    evaluator: "Coordinador Operativo",
    periodicity: "Mensual",
    level: "Táctico",
    unit: "Porcentaje",
    strategy: "Mejorar disciplina operativa",
    status: "Activo",
    deficientGoal: 70,
    acceptableGoal: 85,
    objectiveGoal: 97,
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
    id: "IND-CM-003",
    process: "Comercial",
    name: "Efectividad de conversión comercial",
    management: "Gerencia Comercial",
    evaluator: "Jefe Comercial",
    periodicity: "Mensual",
    level: "Estratégico",
    unit: "Porcentaje",
    strategy: "Incrementar cierres efectivos",
    status: "Activo",
    deficientGoal: 20,
    acceptableGoal: 35,
    objectiveGoal: 50,
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
