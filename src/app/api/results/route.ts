import { NextRequest, NextResponse } from "next/server";
import { AuditAction, AuditEntity } from "@prisma/client";
import { canSubmit, canViewHistory, getCurrentSession } from "@/lib/auth";
import { getAuditRequestContext, logAuditEvent } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

type ResultPayload = {
  indicatorId: string;
  reportingDate: string;
  startDate: string;
  endDate: string;
  periodMonths?: string;
  result?: string;
  indicatorPercentage?: string;
  compliance?: string;
  zeroJustification?: string;
  analysis: string;
  observation: string;
  variableValues: string[];
};

const MAX_VARIABLES = 4;

function generateRecordNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `IND-${datePart}-${randomPart}`;
}

function parseNumericValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function safeDivide(numerator: number, denominator: number) {
  if (!Number.isFinite(denominator) || denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

function formatNumber(value: number) {
  return String(Math.round(value * 100) / 100);
}

function calculatePeriodMonths(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return null;
  }

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(months, 0);
}

function findVariableValue(
  variableNames: string[],
  values: (number | null)[],
  patterns: string[],
) {
  const index = variableNames.findIndex((name) => {
    const normalized = name.toLowerCase();
    return patterns.some((pattern) => normalized.includes(pattern));
  });

  return index >= 0 ? values[index] : null;
}

function calculateIndicatorResult(variableNames: string[], variableValues: string[]) {
  const names = variableNames.slice(0, MAX_VARIABLES);
  const values = variableValues
    .slice(0, MAX_VARIABLES)
    .map((value) => parseNumericValue(value));
  const filledValues = values.filter((value): value is number => value !== null);

  if (filledValues.length === 0) {
    return null;
  }

  const ingresos = findVariableValue(names, values, ["ingreso", "venta"]);
  const costos = findVariableValue(names, values, ["costo"]);

  if (ingresos !== null && costos !== null) {
    const margin = safeDivide(ingresos - costos, ingresos);
    return margin === null ? null : margin * 100;
  }

  const programadas = findVariableValue(names, values, ["programad", "planificad"]);
  const ejecutadas = findVariableValue(names, values, ["ejecutad", "realizad", "cerrad"]);

  if (programadas !== null && ejecutadas !== null) {
    const ratio = safeDivide(ejecutadas, programadas);
    return ratio === null ? null : ratio * 100;
  }

  const propuestas = findVariableValue(names, values, ["propuesta"]);
  const negocios = findVariableValue(names, values, ["negocio", "cierre", "cerrad"]);

  if (propuestas !== null && negocios !== null) {
    const conversion = safeDivide(negocios, propuestas);
    return conversion === null ? null : conversion * 100;
  }

  const first = values[0];
  const second = values[1];

  if (filledValues.length >= 2 && first !== null && second !== null) {
    const ratio = safeDivide(second, first);
    return ratio === null ? null : ratio * 100;
  }

  return filledValues[0];
}

function calculateCompliance(
  result: number,
  indicator: {
    deficientGoal: unknown;
    acceptableGoal: unknown;
    objectiveGoal: unknown;
  },
) {
  const deficient = Number(indicator.deficientGoal);
  const acceptable = Number(indicator.acceptableGoal);
  const objective = Number(indicator.objectiveGoal);
  const lowerIsBetter = objective <= acceptable && acceptable <= deficient;

  if (lowerIsBetter) {
    if (result <= objective) {
      return "Objetiva";
    }

    if (result <= acceptable) {
      return "Aceptable";
    }

    return "Deficiente";
  }

  if (result >= objective) {
    return "Objetiva";
  }

  if (result >= acceptable) {
    return "Aceptable";
  }

  return "Deficiente";
}

export async function GET(request: NextRequest) {
  const session = await getCurrentSession();

  if (!session || !canViewHistory(session.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para consultar el historial." },
      { status: 403 },
    );
  }

  const takeParam = Number(request.nextUrl.searchParams.get("take") ?? "8");
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 100)
    : 8;

  const results = await prisma.indicatorResult.findMany({
    include: {
      indicator: {
        include: {
          process: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
  });

  return NextResponse.json({
    results: results.map((result) => ({
      id: result.id,
      recordNumber: result.recordNumber,
      process: result.indicator.process.name,
      indicator: result.indicator.name,
      submittedBy: result.submittedByName,
      compliance: result.compliance,
      resultValue: Number(result.resultValue),
      indicatorPercent: Number(result.indicatorPercent),
      createdAt: result.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ResultPayload;
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { message: "Debes iniciar sesión para guardar resultados." },
      { status: 401 },
    );
  }

  if (!canSubmit(session.role)) {
    return NextResponse.json(
      { message: "Tu rol no tiene permisos para registrar resultados." },
      { status: 403 },
    );
  }

  if (
    !body.indicatorId ||
    !body.reportingDate ||
    !body.startDate ||
    !body.endDate ||
    !body.analysis
  ) {
    return NextResponse.json(
      { message: "Faltan campos obligatorios para guardar el resultado." },
      { status: 400 },
    );
  }

  const periodMonths = calculatePeriodMonths(body.startDate, body.endDate);

  if (periodMonths === null) {
    return NextResponse.json(
      { message: "La fecha de inicio no puede ser mayor a la fecha de fin." },
      { status: 400 },
    );
  }

  const indicator = await prisma.indicator.findUnique({
    where: { id: body.indicatorId },
    include: {
      variables: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!indicator) {
    return NextResponse.json(
      { message: "El indicador seleccionado no existe." },
      { status: 404 },
    );
  }

  const submittedVariableValues = body.variableValues ?? [];
  const activeVariables = indicator.variables.slice(0, MAX_VARIABLES);
  const resultValue = calculateIndicatorResult(
    activeVariables.map((variable) => variable.name),
    submittedVariableValues,
  );

  if (resultValue === null) {
    return NextResponse.json(
      { message: "Debes diligenciar al menos una variable valida para calcular el resultado." },
      { status: 400 },
    );
  }

  const calculatedResult = formatNumber(resultValue);
  const calculatedCompliance = calculateCompliance(resultValue, indicator);

  const created = await prisma.$transaction(async (transaction) => {
    const result = await transaction.indicatorResult.create({
      data: {
        recordNumber: generateRecordNumber(),
        reportingDate: new Date(body.reportingDate),
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        periodMonths,
        resultValue: calculatedResult,
        indicatorPercent: calculatedResult,
        compliance: calculatedCompliance,
        zeroJustification: body.zeroJustification || null,
        analysis: body.analysis,
        observation: body.observation || null,
        indicatorId: body.indicatorId,
        submittedById: session.userId,
        submittedByName: session.name,
        submittedByEmail: session.email,
        variableValues: {
          create: activeVariables.map((variable, index) => ({
            indicatorVariableId: variable.id,
            numericValue:
              parseNumericValue(submittedVariableValues[index]) === null
                ? null
                : formatNumber(parseNumericValue(submittedVariableValues[index])!),
          })),
        },
      },
      select: {
        id: true,
        recordNumber: true,
      },
    });

    await logAuditEvent({
      client: transaction,
      actor: session,
      action: AuditAction.SUBMIT,
      entityType: AuditEntity.RESULT,
      entityId: result.id,
      summary: "Resultado de indicador registrado.",
      targetName: indicator.name,
      metadata: {
        recordNumber: result.recordNumber,
        compliance: calculatedCompliance,
        resultValue: calculatedResult,
        indicatorPercent: calculatedResult,
      },
      context: getAuditRequestContext(request),
    });

    return result;
  });

  return NextResponse.json(created, { status: 201 });
}
