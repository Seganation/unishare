"use client";

import { useEffect, useState } from "react";

const LOGO_GIFS = [
  "/loading/loader-1.gif",
  "/loading/loader-2.gif",
  "/loading/loader-3.gif",
  "/loading/loader-4.gif",
  "/loading/loader-5.gif",
];

export function RandomLogo() {
  // Use a stable initial value so server-rendered HTML matches
  // the client's initial render. Then pick a random image on mount.
  const [src, setSrc] = useState(LOGO_GIFS[0]);

  useEffect(() => {
    const pick = LOGO_GIFS[Math.floor(Math.random() * LOGO_GIFS.length)];
    setSrc(pick);
  }, []);

  return (
    <img
      src={src}
      alt="UNIShare Logo"
      className="h-full w-full object-contain"
    />
  );
}
