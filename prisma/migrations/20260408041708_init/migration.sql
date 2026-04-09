-- CreateTable
CREATE TABLE "public"."Process" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Indicator" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "management" TEXT NOT NULL,
    "evaluator" TEXT NOT NULL,
    "periodicity" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "strategy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Activo',
    "deficientGoal" DECIMAL(10,2) NOT NULL,
    "acceptableGoal" DECIMAL(10,2) NOT NULL,
    "objectiveGoal" DECIMAL(10,2) NOT NULL,
    "processId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IndicatorVariable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicatorVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IndicatorResult" (
    "id" TEXT NOT NULL,
    "recordNumber" TEXT NOT NULL,
    "reportingDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "periodMonths" INTEGER NOT NULL,
    "resultValue" DECIMAL(10,2) NOT NULL,
    "indicatorPercent" DECIMAL(10,2) NOT NULL,
    "compliance" TEXT NOT NULL,
    "zeroJustification" TEXT,
    "analysis" TEXT NOT NULL,
    "observation" TEXT,
    "indicatorId" TEXT NOT NULL,
    "submittedByName" TEXT,
    "submittedByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicatorResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IndicatorResultVariable" (
    "id" TEXT NOT NULL,
    "numericValue" DECIMAL(14,2),
    "textValue" TEXT,
    "resultId" TEXT NOT NULL,
    "indicatorVariableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicatorResultVariable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Process_name_key" ON "public"."Process"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_code_key" ON "public"."Indicator"("code");

-- CreateIndex
CREATE INDEX "Indicator_processId_idx" ON "public"."Indicator"("processId");

-- CreateIndex
CREATE INDEX "IndicatorVariable_indicatorId_idx" ON "public"."IndicatorVariable"("indicatorId");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorVariable_indicatorId_sortOrder_key" ON "public"."IndicatorVariable"("indicatorId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorResult_recordNumber_key" ON "public"."IndicatorResult"("recordNumber");

-- CreateIndex
CREATE INDEX "IndicatorResult_indicatorId_idx" ON "public"."IndicatorResult"("indicatorId");

-- CreateIndex
CREATE INDEX "IndicatorResult_reportingDate_idx" ON "public"."IndicatorResult"("reportingDate");

-- CreateIndex
CREATE INDEX "IndicatorResultVariable_resultId_idx" ON "public"."IndicatorResultVariable"("resultId");

-- CreateIndex
CREATE INDEX "IndicatorResultVariable_indicatorVariableId_idx" ON "public"."IndicatorResultVariable"("indicatorVariableId");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorResultVariable_resultId_indicatorVariableId_key" ON "public"."IndicatorResultVariable"("resultId", "indicatorVariableId");

-- AddForeignKey
ALTER TABLE "public"."Indicator" ADD CONSTRAINT "Indicator_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IndicatorVariable" ADD CONSTRAINT "IndicatorVariable_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "public"."Indicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IndicatorResult" ADD CONSTRAINT "IndicatorResult_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "public"."Indicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IndicatorResultVariable" ADD CONSTRAINT "IndicatorResultVariable_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "public"."IndicatorResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IndicatorResultVariable" ADD CONSTRAINT "IndicatorResultVariable_indicatorVariableId_fkey" FOREIGN KEY ("indicatorVariableId") REFERENCES "public"."IndicatorVariable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
