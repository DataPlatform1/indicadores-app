import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Manrope } from "next/font/google";
import { BRANDING } from "@/lib/branding";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
                --background: ${BRANDING.visualStyle.background};
                --foreground: ${BRANDING.visualStyle.text};
                --muted-text: ${BRANDING.visualStyle.mutedText};
                --panel-background: ${BRANDING.visualStyle.panelBackground};
                --panel-border: ${BRANDING.visualStyle.panelBorder};
                --muted-surface: ${BRANDING.visualStyle.mutedSurface};
                --brand-primary: ${BRANDING.visualStyle.primary};
                --brand-primary-hover: ${BRANDING.visualStyle.primaryHover};
                --brand-secondary: ${BRANDING.visualStyle.secondary};
                --brand-accent: ${BRANDING.visualStyle.accent};
                --brand-accent-text: ${BRANDING.visualStyle.accentText};
                --field-border: ${BRANDING.visualStyle.inputBorder};
                --field-focus: ${BRANDING.visualStyle.inputFocus};
                --field-disabled: ${BRANDING.visualStyle.inputDisabled};
                --card-shadow: ${BRANDING.visualStyle.cardShadow};
                --font-app-sans: var(${BRANDING.fonts.sansVar});
                --font-app-display: var(${BRANDING.fonts.displayVar});
                --font-app-mono: var(${BRANDING.fonts.monoVar});
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}

