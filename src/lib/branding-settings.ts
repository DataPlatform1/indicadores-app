import { prisma } from "@/lib/prisma";
import { BRANDING } from "@/lib/branding";

export type BrandingSettings = {
  organizationName: string;
  shortName: string;
  appTitle: string;
  appDescription: string;
  appEyebrow: string;
  appSummary: string;
  loginBadge: string;
  loginTitle: string;
  loginDescription: string;
  loginSupportTitle: string;
  loginSupportText: string;
  visualStyle: {
    background: string;
    panelBackground: string;
    panelBorder: string;
    mutedSurface: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    accentText: string;
    text: string;
    mutedText: string;
    inputBorder: string;
    inputFocus: string;
    inputDisabled: string;
    cardShadow: string;
  };
  fonts: {
    sansVar: string;
    displayVar: string;
    monoVar: string;
  };
  assets: {
    logoText: string;
    loginImageUrl: string;
    logoImageUrl: string;
  };
};

export async function getResolvedBranding(): Promise<BrandingSettings> {
  try {
    const settings = await prisma.brandSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      return BRANDING;
    }

    return {
      organizationName: settings.organizationName,
      shortName: settings.shortName,
      appTitle: settings.appTitle,
      appDescription: settings.appDescription,
      appEyebrow: settings.appEyebrow,
      appSummary: settings.appSummary,
      loginBadge: settings.loginBadge,
      loginTitle: settings.loginTitle,
      loginDescription: settings.loginDescription,
      loginSupportTitle: settings.loginSupportTitle,
      loginSupportText: settings.loginSupportText,
      visualStyle: {
        background: settings.background,
        panelBackground: settings.panelBackground,
        panelBorder: settings.panelBorder,
        mutedSurface: settings.mutedSurface,
        primary: settings.primary,
        primaryHover: settings.primaryHover,
        secondary: settings.secondary,
        accent: settings.accent,
        accentText: settings.accentText,
        text: settings.text,
        mutedText: settings.mutedText,
        inputBorder: settings.inputBorder,
        inputFocus: settings.inputFocus,
        inputDisabled: settings.inputDisabled,
        cardShadow: settings.cardShadow,
      },
      fonts: BRANDING.fonts,
      assets: {
        logoText: settings.logoText,
        loginImageUrl: settings.loginImageUrl || "",
        logoImageUrl: settings.logoImageUrl || "",
      },
    };
  } catch {
    return BRANDING;
  }
}
