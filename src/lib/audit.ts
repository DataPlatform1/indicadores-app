import { AuditAction, AuditEntity, Prisma, PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type AuditClient = PrismaClient | Prisma.TransactionClient;

export type AuditActor = {
  userId: string;
  email: string;
  role: string;
  name: string;
} | null;

type AuditContext = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

type AuditEventInput = {
  client?: AuditClient;
  actor: AuditActor;
  action: AuditAction;
  entityType: AuditEntity;
  entityId?: string | null;
  summary: string;
  targetName?: string | null;
  metadata?: Prisma.InputJsonValue;
  context?: AuditContext;
};

export function getAuditRequestContext(request: NextRequest): AuditContext {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");

  return {
    ipAddress: forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || null,
    userAgent: userAgent?.trim() || null,
  };
}

export function getChangedFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  return Object.keys(after).filter((key) => {
    return JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null);
  });
}

export async function logAuditEvent({
  client = prisma,
  actor,
  action,
  entityType,
  entityId,
  summary,
  targetName,
  metadata,
  context,
}: AuditEventInput) {
  try {
    await client.auditLog.create({
      data: {
        action,
        entityType,
        entityId: entityId || null,
        summary,
        targetName: targetName || null,
        actorUser: actor?.userId ? { connect: { id: actor.userId } } : undefined,
        actorName: actor?.name || null,
        actorEmail: actor?.email || null,
        actorRole: actor?.role || null,
        ipAddress: context?.ipAddress || null,
        userAgent: context?.userAgent || null,
        ...(metadata !== undefined ? { metadata } : {}),
      },
    });
  } catch (error) {
    console.warn("No fue posible registrar auditoria.", error);
  }
}
