"use client";

import { useMemo } from "react";

const LOGO_GIFS = [
  "/loading/loader-1.gif",
  "/loading/loader-2.gif",
  "/loading/loader-3.gif",
  "/loading/loader-4.gif",
  "/loading/loader-5.gif",
];

export function RandomLogo() {
  const randomLogo = useMemo(
    () => LOGO_GIFS[Math.floor(Math.random() * LOGO_GIFS.length)],
    [],
  );

  return (
    <img
      src={randomLogo}
      alt="UNIShare Logo"
      className="h-full w-full object-contain"
    />
  );
}
