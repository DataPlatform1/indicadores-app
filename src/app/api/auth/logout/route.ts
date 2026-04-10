import { NextResponse } from "next/server";
import { AuditAction, AuditEntity } from "@prisma/client";
import { getCurrentSession, sessionCookieName } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST() {
  const session = await getCurrentSession();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(sessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  if (session) {
    await logAuditEvent({
      actor: session,
      action: AuditAction.LOGOUT,
      entityType: AuditEntity.AUTH,
      entityId: session.userId,
      summary: "Cierre de sesion.",
      targetName: session.email,
    });
  }

  return response;
}
