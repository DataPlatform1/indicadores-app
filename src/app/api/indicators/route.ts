import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/roles";

type IndicatorPayload = {
  id?: string;
  code?: string;
  name?: string;
  processId?: string;
  management?: string;
  evaluator?: string;
  periodicity?: string;
  level?: string;
  unit?: string;
  strategy?: string;
  status?: string;
  deficientGoal?: string;
  acceptableGoal?: string;
  objectiveGoal?: string;
  variableNames?: string[];
};

function normalizeVariables(variableNames: string[] | undefined) {
  return Array.from({ length: 8 }, (_, index) => {
    const providedName = variableNames?.[index]?.trim();
    return providedName || `Variable ${index + 1}`;
  });
}

async function ensureAdminAccess() {
  const session = await getCurrentSession();

  if (!session || !canManageUsers(session.role)) {
    return null;
  }

  return session;
}

export async function GET() {
  const session = await ensureAdminAccess();

  if (!session) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar indicadores." },
      { status: 403 },
    );
  }

  const [processes, indicators] = await Promise.all([
    prisma.process.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
      },
    }),
    prisma.indicator.findMany({
      include: {
        process: true,
        variables: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [{ process: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  return NextResponse.json({
    processes,
    indicators: indicators.map((indicator) => ({
      id: indicator.id,
      code: indicator.code,
      name: indicator.name,
      processId: indicator.processId,
      processName: indicator.process.name,
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
      createdAt: indicator.createdAt.toISOString(),
      updatedAt: indicator.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await ensureAdminAccess();

  if (!session) {
    return NextResponse.json(
      { message: "No tienes permisos para crear indicadores." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as IndicatorPayload;
  const code = body.code?.trim();
  const name = body.name?.trim();
  const processId = body.processId?.trim();
  const management = body.management?.trim();
  const evaluator = body.evaluator?.trim();
  const periodicity = body.periodicity?.trim();
  const level = body.level?.trim();
  const unit = body.unit?.trim();
  const strategy = body.strategy?.trim() || null;
  const status = body.status?.trim() || "Activo";
  const deficientGoal = body.deficientGoal?.trim();
  const acceptableGoal = body.acceptableGoal?.trim();
  const objectiveGoal = body.objectiveGoal?.trim();
  const variableNames = normalizeVariables(body.variableNames);

  if (
    !code ||
    !name ||
    !processId ||
    !management ||
    !evaluator ||
    !periodicity ||
    !level ||
    !unit ||
    !deficientGoal ||
    !acceptableGoal ||
    !objectiveGoal
  ) {
    return NextResponse.json(
      { message: "Debes diligenciar todos los campos principales del indicador." },
      { status: 400 },
    );
  }

  if (!["Activo", "Inactivo"].includes(status)) {
    return NextResponse.json(
      { message: "El estado seleccionado no es valido." },
      { status: 400 },
    );
  }

  const existingIndicator = await prisma.indicator.findUnique({
    where: { code },
    select: { id: true },
  });

  if (existingIndicator) {
    return NextResponse.json(
      { message: "Ya existe un indicador con ese codigo." },
      { status: 409 },
    );
  }

  const createdIndicator = await prisma.indicator.create({
    data: {
      code,
      name,
      processId,
      management,
      evaluator,
      periodicity,
      level,
      unit,
      strategy,
      status,
      deficientGoal,
      acceptableGoal,
      objectiveGoal,
      variables: {
        create: variableNames.map((variableName, index) => ({
          name: variableName,
          sortOrder: index + 1,
        })),
      },
    },
    include: {
      process: true,
      variables: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(
    {
      indicator: {
        id: createdIndicator.id,
        code: createdIndicator.code,
        name: createdIndicator.name,
        processId: createdIndicator.processId,
        processName: createdIndicator.process.name,
        management: createdIndicator.management,
        evaluator: createdIndicator.evaluator,
        periodicity: createdIndicator.periodicity,
        level: createdIndicator.level,
        unit: createdIndicator.unit,
        strategy: createdIndicator.strategy,
        status: createdIndicator.status,
        deficientGoal: Number(createdIndicator.deficientGoal),
        acceptableGoal: Number(createdIndicator.acceptableGoal),
        objectiveGoal: Number(createdIndicator.objectiveGoal),
        variableNames: createdIndicator.variables.map((variable) => variable.name),
        createdAt: createdIndicator.createdAt.toISOString(),
        updatedAt: createdIndicator.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest) {
  const session = await ensureAdminAccess();

  if (!session) {
    return NextResponse.json(
      { message: "No tienes permisos para actualizar indicadores." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as IndicatorPayload;
  const id = body.id?.trim();
  const code = body.code?.trim();
  const name = body.name?.trim();
  const processId = body.processId?.trim();
  const management = body.management?.trim();
  const evaluator = body.evaluator?.trim();
  const periodicity = body.periodicity?.trim();
  const level = body.level?.trim();
  const unit = body.unit?.trim();
  const strategy = body.strategy?.trim() || null;
  const status = body.status?.trim() || "Activo";
  const deficientGoal = body.deficientGoal?.trim();
  const acceptableGoal = body.acceptableGoal?.trim();
  const objectiveGoal = body.objectiveGoal?.trim();
  const variableNames = normalizeVariables(body.variableNames);

  if (
    !id ||
    !code ||
    !name ||
    !processId ||
    !management ||
    !evaluator ||
    !periodicity ||
    !level ||
    !unit ||
    !deficientGoal ||
    !acceptableGoal ||
    !objectiveGoal
  ) {
    return NextResponse.json(
      { message: "Debes diligenciar todos los campos principales del indicador." },
      { status: 400 },
    );
  }

  if (!["Activo", "Inactivo"].includes(status)) {
    return NextResponse.json(
      { message: "El estado seleccionado no es valido." },
      { status: 400 },
    );
  }

  const conflictingIndicator = await prisma.indicator.findFirst({
    where: {
      code,
      NOT: {
        id,
      },
    },
    select: { id: true },
  });

  if (conflictingIndicator) {
    return NextResponse.json(
      { message: "Ya existe otro indicador con ese codigo." },
      { status: 409 },
    );
  }

  const updatedIndicator = await prisma.$transaction(async (transaction) => {
    const indicator = await transaction.indicator.update({
      where: { id },
      data: {
        code,
        name,
        processId,
        management,
        evaluator,
        periodicity,
        level,
        unit,
        strategy,
        status,
        deficientGoal,
        acceptableGoal,
        objectiveGoal,
      },
      include: {
        process: true,
        variables: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    for (const [index, variableName] of variableNames.entries()) {
      const existingVariable = indicator.variables[index];

      if (existingVariable) {
        await transaction.indicatorVariable.update({
          where: { id: existingVariable.id },
          data: { name: variableName },
        });
      } else {
        await transaction.indicatorVariable.create({
          data: {
            indicatorId: id,
            name: variableName,
            sortOrder: index + 1,
          },
        });
      }
    }

    const refreshedIndicator = await transaction.indicator.findUniqueOrThrow({
      where: { id },
      include: {
        process: true,
        variables: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return refreshedIndicator;
  });

  return NextResponse.json({
    indicator: {
      id: updatedIndicator.id,
      code: updatedIndicator.code,
      name: updatedIndicator.name,
      processId: updatedIndicator.processId,
      processName: updatedIndicator.process.name,
      management: updatedIndicator.management,
      evaluator: updatedIndicator.evaluator,
      periodicity: updatedIndicator.periodicity,
      level: updatedIndicator.level,
      unit: updatedIndicator.unit,
      strategy: updatedIndicator.strategy,
      status: updatedIndicator.status,
      deficientGoal: Number(updatedIndicator.deficientGoal),
      acceptableGoal: Number(updatedIndicator.acceptableGoal),
      objectiveGoal: Number(updatedIndicator.objectiveGoal),
      variableNames: updatedIndicator.variables.map((variable) => variable.name),
      createdAt: updatedIndicator.createdAt.toISOString(),
      updatedAt: updatedIndicator.updatedAt.toISOString(),
    },
  });
}
