"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function WelcomeLoader() {
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Show welcome loader if coming from login or if welcome param is present
    if (searchParams.get("welcome") === "true") {
      setShow(true);
      // Hide after 2 seconds
      setTimeout(() => {
        setShow(false);
      }, 2000);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 transition-opacity duration-500">
      <div className="animate-in fade-in zoom-in-50 duration-700">
        <img
          src="/login-loader-after-login.gif"
          alt="Loading"
          className="h-32 w-32 object-contain"
        />
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-2 text-center duration-1000">
        <h3 className="text-2xl font-bold text-white">Welcome Back!</h3>
        <p className="text-lg text-purple-200">
          Taking you to your dashboard...
        </p>
      </div>
    </div>
  );
}
