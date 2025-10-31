import "~/styles/globals.css";

import { type Metadata } from "next";
import { Knewave } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";

export const metadata: Metadata = {
  title: "UNIShare - Collaborative Learning Platform",
  description:
    "Share courses, resources, and collaborate with students in real-time",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const knewave = Knewave({
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={knewave.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
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
