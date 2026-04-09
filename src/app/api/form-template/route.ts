import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const processes = await prisma.process.findMany({
    orderBy: { name: "asc" },
  });

  const indicators = await prisma.indicator.findMany({
    where: {
      status: "Activo",
    },
    include: {
      process: true,
      variables: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ process: { name: "asc" } }, { name: "asc" }],
  });

  return NextResponse.json({
    processes: processes.map((process) => ({
      id: process.id,
      name: process.name,
      description: process.description,
    })),
    indicators: indicators.map((indicator) => ({
      id: indicator.id,
      code: indicator.code,
      name: indicator.name,
      process: indicator.process.name,
      management: indicator.management,
      evaluator: indicator.evaluator,
      periodicity: indicator.periodicity,
      level: indicator.level,
      unit: indicator.unit,
      strategy: indicator.strategy,
      status: indicator.status,
      deficientGoal: Number(indicator.deficientGoal),
      acceptableGoal: Number(indicator.acceptableGoal),
      objectiveGoal: Number(indicator.objectiveGoal),
      variableNames: indicator.variables.map((variable) => variable.name),
      variableIds: indicator.variables.map((variable) => variable.id),
    })),
  });
}
