import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Manrope } from "next/font/google";
import { BRANDING } from "@/lib/branding";
import { getResolvedBranding } from "@/lib/branding-settings";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: BRANDING.organizationName,
  description: BRANDING.appDescription,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getResolvedBranding();

  return (
    <html
      lang="es"
      className={`${manrope.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --background: ${branding.visualStyle.background};
                --foreground: ${branding.visualStyle.text};
                --muted-text: ${branding.visualStyle.mutedText};
                --panel-background: ${branding.visualStyle.panelBackground};
                --panel-border: ${branding.visualStyle.panelBorder};
                --muted-surface: ${branding.visualStyle.mutedSurface};
                --brand-primary: ${branding.visualStyle.primary};
                --brand-primary-hover: ${branding.visualStyle.primaryHover};
                --brand-secondary: ${branding.visualStyle.secondary};
                --brand-accent: ${branding.visualStyle.accent};
                --brand-accent-text: ${branding.visualStyle.accentText};
                --field-border: ${branding.visualStyle.inputBorder};
                --field-focus: ${branding.visualStyle.inputFocus};
                --field-disabled: ${branding.visualStyle.inputDisabled};
                --card-shadow: ${branding.visualStyle.cardShadow};
                --font-app-sans: var(${branding.fonts.sansVar});
                --font-app-display: var(${branding.fonts.displayVar});
                --font-app-mono: var(${branding.fonts.monoVar});
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}

