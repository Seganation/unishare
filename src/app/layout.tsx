import "~/styles/globals.css";

import { type Metadata } from "next";
import { Knewave, Sour_Gummy } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "~/app/api/uploadthing/core";

export const metadata: Metadata = {
  title: "UNIShare - Collaborative Learning Platform",
  description:
    "Share courses, resources, and collaborate with students in real-time",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Font for UNIShare branding and titles
const knewave = Knewave({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

// Font for body text and general content
const sourGummy = Sour_Gummy({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${knewave.variable} ${sourGummy.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
