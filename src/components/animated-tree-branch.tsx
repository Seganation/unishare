"use client";

import { useEffect, useRef } from "react";

export function AnimatedTreeBranch() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (imgRef.current) {
        // Stop animation by replacing src with itself (forces last frame)
        const currentSrc = imgRef.current.src;
        imgRef.current.src = "";
        imgRef.current.src = currentSrc;
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <img
      ref={imgRef}
      src="/tree-branch-grow.gif"
      alt=""
      className="pointer-events-none fixed right-0 bottom-0 z-50 h-64 w-auto"
    />
  );
}
