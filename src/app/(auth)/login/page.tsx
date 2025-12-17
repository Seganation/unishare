"use client";

import { useState, useMemo, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [randomLogo, setRandomLogo] = useState("/loading/loader-1.gif");

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push("/courses");
      }
    };
    checkSession();
  }, [router]);

  const LOGO_GIFS = [
    "/loading/loader-1.gif",
    "/loading/loader-2.gif",
    "/loading/loader-3.gif",
    "/loading/loader-4.gif",
    "/loading/loader-5.gif",
  ];

  // Set random logo on client side only to avoid hydration mismatch
  useEffect(() => {
    setRandomLogo(LOGO_GIFS[Math.floor(Math.random() * LOGO_GIFS.length)]!);
  }, []);

  // Carousel GIFs (the three you asked to load)
  const CAROUSEL_GIFS = ["/unishare-assets.gif"];

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

      console.log("[LOGIN] signIn result:", result);

      if (result?.error) {
        console.log("[LOGIN] Error:", result.error);
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log("[LOGIN] Success! Redirecting...");
        // Successful login - show loader and redirect
        setIsRedirecting(true);
        // Small delay to show the loader before redirect
        setTimeout(() => {
          console.log("[LOGIN] Redirecting to /courses");
          window.location.href = "/courses";
        }, 1500);
      } else {
        console.log("[LOGIN] Unexpected state:", result);
        setError("An unexpected error occurred");
        setIsLoading(false);
      }
    } catch (error) {
      console.log("[LOGIN] Exception:", error);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Loading Overlay - Shows when redirecting after successful login */}
      {isRedirecting && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 transition-opacity duration-500">
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
      )}

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

      {/* Main Content: two-column layout (left: login, right: carousel) */}
      <div
        className={`relative w-full max-w-6xl transition-opacity duration-500 ${isRedirecting ? "opacity-0" : "opacity-100"}`}
      >
        <div className="mx-auto flex w-full flex-col gap-8 px-4">
          {/* Header with Logo */}
          <div className="text-center md:text-left">
            {/* Logo GIF with UNIShare text */}
            <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
              <img
                src={randomLogo}
                alt="UNIShare Logo"
                className="h-14 w-14 object-contain"
              />
              <h1 className="font-unishare text-5xl font-black text-white drop-shadow-lg">
                UNIShare
              </h1>
            </div>
            <p className="text-lg font-medium text-purple-100">
              Student-driven academic organization platform
            </p>
          </div>

          {/* Merged Card with Login and Carousel */}
          <div className="glass group relative overflow-hidden rounded-3xl border-2 border-white/30 bg-white/10 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

            <div className="relative flex flex-col-reverse md:flex-row">
              {/* Left: Login Form */}
              <div className="w-full p-8 md:w-1/2">
                {/* Welcome Header */}
                <div className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-pulse text-yellow-400" />
                    <span className="text-sm font-semibold tracking-wider text-purple-200 uppercase">
                      Authentication
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-white">
                    Welcome Back
                  </h2>
                  <p className="mt-2 text-sm text-purple-200">
                    Sign in to access your courses and resources
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="animate-in slide-in-from-top-2 mb-6 flex items-start gap-3 rounded-xl border-2 border-red-400 bg-red-100/90 p-4 backdrop-blur-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
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
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
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
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
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
                <div className="mt-8 text-center md:text-left">
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

              {/* Right: Carousel - Hidden on mobile */}
              <div className="hidden w-full border-l-2 border-white/20 p-8 md:block md:w-1/2">
                <AutoPlayCarousel gifs={CAROUSEL_GIFS} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm font-medium text-white/80 md:text-left">
            © {new Date().getFullYear()} UNIShare. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

function AutoPlayCarousel({ gifs }: { gifs: string[] }) {
  const [api, setApi] = useState<any>();

  useEffect(() => {
    if (!api) return;

    // advance every 3s
    const id = setInterval(() => {
      try {
        api.scrollNext();
      } catch (e) {
        // ignore
      }
    }, 3000);

    return () => clearInterval(id);
  }, [api]);

  return (
    <Carousel opts={{ loop: true }} setApi={setApi} className="w-full">
      <CarouselContent className="-ml-0">
        {gifs.map((g, i) => (
          <CarouselItem key={i} className="pl-0">
            <div className="flex max-h-[450px] items-center justify-center overflow-hidden">
              <img
                src={g}
                alt={`carousel-${i}`}
                className="h-full w-full rounded-2xl object-contain"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
