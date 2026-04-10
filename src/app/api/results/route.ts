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
  periodMonths: string;
  result: string;
  indicatorPercentage: string;
  compliance: string;
  zeroJustification: string;
  analysis: string;
  observation: string;
  variableValues: string[];
};

function generateRecordNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `IND-${datePart}-${randomPart}`;
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
    !body.periodMonths ||
    !body.result ||
    !body.indicatorPercentage ||
    !body.compliance ||
    !body.analysis
  ) {
    return NextResponse.json(
      { message: "Faltan campos obligatorios para guardar el resultado." },
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

  const created = await prisma.$transaction(async (transaction) => {
    const result = await transaction.indicatorResult.create({
      data: {
        recordNumber: generateRecordNumber(),
        reportingDate: new Date(body.reportingDate),
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        periodMonths: Number(body.periodMonths),
        resultValue: body.result,
        indicatorPercent: body.indicatorPercentage,
        compliance: body.compliance,
        zeroJustification: body.zeroJustification || null,
        analysis: body.analysis,
        observation: body.observation || null,
        indicatorId: body.indicatorId,
        submittedById: session.userId,
        submittedByName: session.name,
        submittedByEmail: session.email,
        variableValues: {
          create: indicator.variables.map((variable, index) => ({
            indicatorVariableId: variable.id,
            numericValue: body.variableValues[index]
              ? body.variableValues[index]
              : null,
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
        compliance: body.compliance,
        resultValue: body.result,
        indicatorPercent: body.indicatorPercentage,
      },
      context: getAuditRequestContext(request),
    });

    return result;
  });

  return NextResponse.json(created, { status: 201 });
}
