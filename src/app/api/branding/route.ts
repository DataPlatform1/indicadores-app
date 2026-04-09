import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/roles";
import { BRANDING } from "@/lib/branding";

async function ensureAdminAccess() {
  const session = await getCurrentSession();

  if (!session || !canManageUsers(session.role)) {
    return null;
  }

  return session;
}

export async function GET() {
  const settings = await prisma.brandSettings.findUnique({
    where: { id: "default" },
  });

  return NextResponse.json({
    settings: settings || null,
    defaults: BRANDING,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await ensureAdminAccess();

  if (!session) {
    return NextResponse.json(
      { message: "No tienes permisos para actualizar el diseno." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    organizationName?: string;
    shortName?: string;
    appTitle?: string;
    appDescription?: string;
    appEyebrow?: string;
    appSummary?: string;
    loginBadge?: string;
    loginTitle?: string;
    loginDescription?: string;
    loginSupportTitle?: string;
    loginSupportText?: string;
    background?: string;
    panelBackground?: string;
    panelBorder?: string;
    mutedSurface?: string;
    primary?: string;
    primaryHover?: string;
    secondary?: string;
    accent?: string;
    accentText?: string;
    text?: string;
    mutedText?: string;
    inputBorder?: string;
    inputFocus?: string;
    inputDisabled?: string;
    cardShadow?: string;
    logoText?: string;
    loginImageUrl?: string;
    logoImageUrl?: string;
  };

  const requiredFields = [
    "organizationName",
    "shortName",
    "appTitle",
    "appDescription",
    "appEyebrow",
    "appSummary",
    "loginBadge",
    "loginTitle",
    "loginDescription",
    "loginSupportTitle",
    "loginSupportText",
    "background",
    "panelBackground",
    "panelBorder",
    "mutedSurface",
    "primary",
    "primaryHover",
    "secondary",
    "accent",
    "accentText",
    "text",
    "mutedText",
    "inputBorder",
    "inputFocus",
    "inputDisabled",
    "cardShadow",
    "logoText",
  ] as const;

  for (const field of requiredFields) {
    const value = body[field];

    if (!value || !value.trim()) {
      return NextResponse.json(
        { message: `El campo ${field} es obligatorio.` },
        { status: 400 },
      );
    }
  }

  const settings = await prisma.brandSettings.upsert({
    where: { id: "default" },
    update: {
      organizationName: body.organizationName!.trim(),
      shortName: body.shortName!.trim(),
      appTitle: body.appTitle!.trim(),
      appDescription: body.appDescription!.trim(),
      appEyebrow: body.appEyebrow!.trim(),
      appSummary: body.appSummary!.trim(),
      loginBadge: body.loginBadge!.trim(),
      loginTitle: body.loginTitle!.trim(),
      loginDescription: body.loginDescription!.trim(),
      loginSupportTitle: body.loginSupportTitle!.trim(),
      loginSupportText: body.loginSupportText!.trim(),
      background: body.background!.trim(),
      panelBackground: body.panelBackground!.trim(),
      panelBorder: body.panelBorder!.trim(),
      mutedSurface: body.mutedSurface!.trim(),
      primary: body.primary!.trim(),
      primaryHover: body.primaryHover!.trim(),
      secondary: body.secondary!.trim(),
      accent: body.accent!.trim(),
      accentText: body.accentText!.trim(),
      text: body.text!.trim(),
      mutedText: body.mutedText!.trim(),
      inputBorder: body.inputBorder!.trim(),
      inputFocus: body.inputFocus!.trim(),
      inputDisabled: body.inputDisabled!.trim(),
      cardShadow: body.cardShadow!.trim(),
      logoText: body.logoText!.trim(),
      loginImageUrl: body.loginImageUrl?.trim() || null,
      logoImageUrl: body.logoImageUrl?.trim() || null,
    },
    create: {
      id: "default",
      organizationName: body.organizationName!.trim(),
      shortName: body.shortName!.trim(),
      appTitle: body.appTitle!.trim(),
      appDescription: body.appDescription!.trim(),
      appEyebrow: body.appEyebrow!.trim(),
      appSummary: body.appSummary!.trim(),
      loginBadge: body.loginBadge!.trim(),
      loginTitle: body.loginTitle!.trim(),
      loginDescription: body.loginDescription!.trim(),
      loginSupportTitle: body.loginSupportTitle!.trim(),
      loginSupportText: body.loginSupportText!.trim(),
      background: body.background!.trim(),
      panelBackground: body.panelBackground!.trim(),
      panelBorder: body.panelBorder!.trim(),
      mutedSurface: body.mutedSurface!.trim(),
      primary: body.primary!.trim(),
      primaryHover: body.primaryHover!.trim(),
      secondary: body.secondary!.trim(),
      accent: body.accent!.trim(),
      accentText: body.accentText!.trim(),
      text: body.text!.trim(),
      mutedText: body.mutedText!.trim(),
      inputBorder: body.inputBorder!.trim(),
      inputFocus: body.inputFocus!.trim(),
      inputDisabled: body.inputDisabled!.trim(),
      cardShadow: body.cardShadow!.trim(),
      logoText: body.logoText!.trim(),
      loginImageUrl: body.loginImageUrl?.trim() || null,
      logoImageUrl: body.logoImageUrl?.trim() || null,
    },
  });

  return NextResponse.json({ settings });
}
