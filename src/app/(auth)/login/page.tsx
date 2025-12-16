"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const LOGO_GIFS = [
    "/loading/loader-1.gif",
    "/loading/loader-2.gif",
    "/loading/loader-3.gif",
    "/loading/loader-4.gif",
    "/loading/loader-5.gif",
  ];

  const randomLogo = useMemo(
    () => LOGO_GIFS[Math.floor(Math.random() * LOGO_GIFS.length)],
    [],
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Successful login - use window.location to ensure proper session refresh
        window.location.href = "/courses";
      } else {
        setError("An unexpected error occurred");
        setIsLoading(false);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Animated Gradient Background */}
      <div className="animated-gradient absolute inset-0" />

      {/* Decorative Pattern Overlay */}
      <div className="pattern-dots absolute inset-0 opacity-10" />

      {/* Floating Decorative Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="float absolute -top-32 -right-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="float animation-delay-2000 absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="float animation-delay-4000 absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-2xl" />
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md space-y-8">
        {/* Header with Logo */}
        <div className="text-center">
          {/* Logo GIF with UNIShare text */}
          <div className="mb-4 flex items-center justify-center gap-3">
            <img
              src={randomLogo}
              alt="UNIShare Logo"
              className="h-14 w-14 object-contain"
            />
            <h1 className="text-5xl font-black text-white drop-shadow-lg">
              UNIShare
            </h1>
          </div>
          <p className="text-lg font-medium text-purple-100">
            Student-driven academic organization platform
          </p>
        </div>

        {/* Login Card with Glassmorphism */}
        <div className="glass group relative overflow-hidden rounded-3xl border-2 border-white/30 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

          <div className="relative">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-pulse text-yellow-400" />
                <span className="text-sm font-semibold tracking-wider text-purple-200 uppercase">
                  Authentication
                </span>
              </div>
              <h2 className="text-3xl font-black text-white">Welcome Back</h2>
              <p className="mt-2 text-sm text-purple-200">
                Sign in to access your courses and resources
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="animate-in slide-in-from-top-2 mb-6 flex items-start gap-3 rounded-xl border-2 border-red-400 bg-red-100/90 p-4 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-bold text-white"
                >
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input-primary w-full bg-white/90 backdrop-blur-sm transition-all focus:bg-white"
                    placeholder="you@university.edu"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="flex items-center gap-2 text-sm font-bold text-white"
                >
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input-primary w-full bg-white/90 backdrop-blur-sm transition-all focus:bg-white"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group/btn relative h-12 w-full overflow-hidden rounded-xl bg-white font-bold text-purple-700 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-visible:ring-4 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {/* Button shimmer */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-200 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />

                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-purple-700 border-t-transparent" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-purple-100">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-white underline decoration-2 underline-offset-4 transition-all hover:text-yellow-300 hover:decoration-yellow-300"
                >
                  Sign Up Here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm font-medium text-white/80">
          © {new Date().getFullYear()} UNIShare. All rights reserved.
        </p>
      </div>
    </div>
  );
}
