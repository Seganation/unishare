"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadDropzone } from "~/lib/uploadthing";
import { api } from "~/trpc/react";
import {
  Mail,
  Lock,
  User,
  Building2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [studentIdUrl, setStudentIdUrl] = useState("");

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
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    universityId: "",
    facultyId: "",
  });

  // Fetch universities with faculties
  const { data: universities, isLoading: universitiesLoading } =
    api.user.getUniversities.useQuery();

  // Get faculties for selected university
  const faculties = useMemo(() => {
    if (!formData.universityId || !universities) return [];
    const selectedUni = universities.find(
      (uni) => uni.id === formData.universityId,
    );
    return selectedUni?.faculties ?? [];
  }, [formData.universityId, universities]);

  // Register mutation
  const registerMutation = api.user.register.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError("");
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (!studentIdUrl) {
      setError("Please upload your student ID");
      setIsLoading(false);
      return;
    }

    // Submit registration
    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      universityId: formData.universityId,
      facultyId: formData.facultyId,
      studentIdUrl: studentIdUrl,
    });
  };

  if (success) {
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

        <div className="relative w-full max-w-md space-y-8">
          <div className="glass group relative overflow-hidden rounded-3xl border-2 border-white/30 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            <div className="relative text-center">
              <div className="mb-4 text-6xl">✅</div>
              <h2 className="mb-2 text-2xl font-bold text-white">
                Registration Successful!
              </h2>
              <p className="mb-4 text-purple-100">
                Your account has been created and is pending admin approval.
              </p>
              <p className="text-sm text-purple-200">
                You'll receive an email once your account is approved.
                <br />
                Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="relative w-full max-w-6xl space-y-6">
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

        {/* Signup Card with Glassmorphism */}
        <div className="glass group relative overflow-hidden rounded-3xl border-2 border-white/30 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

          <div className="relative">
            {/* Welcome Header */}
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-pulse text-yellow-400" />
                <span className="text-sm font-semibold tracking-wider text-purple-200 uppercase">
                  Create Account
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">Join UNIShare</h2>
              <p className="mt-1 text-xs text-purple-200">
                Create an account to access courses and resources
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="animate-in slide-in-from-top-2 mb-4 flex items-start gap-3 rounded-xl border-2 border-red-400 bg-red-100/90 p-3 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <p className="text-xs font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Form Grid (responsive) */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name - Col 1 */}
              <div className="space-y-1">
                <label
                  htmlFor="name"
                  className="flex items-center gap-2 text-xs font-bold text-white"
                >
                  <User className="h-3 w-3" />
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-primary h-9 w-full bg-white/90 text-sm backdrop-blur-sm transition-all focus:bg-white"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>

              {/* Email - Col 2 */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-xs font-bold text-white"
                >
                  <Mail className="h-3 w-3" />
                  University Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-primary h-9 w-full bg-white/90 text-sm backdrop-blur-sm transition-all focus:bg-white"
                  placeholder="you@university.edu"
                  disabled={isLoading}
                />
              </div>

              {/* Password - Col 1 */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="flex items-center gap-2 text-xs font-bold text-white"
                >
                  <Lock className="h-3 w-3" />
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input-primary h-9 w-full bg-white/90 text-sm backdrop-blur-sm transition-all focus:bg-white"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password - Col 2 */}
              <div className="space-y-1">
                <label
                  htmlFor="confirmPassword"
                  className="flex items-center gap-2 text-xs font-bold text-white"
                >
                  <Lock className="h-3 w-3" />
                  Confirm
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="input-primary h-9 w-full bg-white/90 text-sm backdrop-blur-sm transition-all focus:bg-white"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {/* University - Col 1 */}
              <div className="space-y-1">
                <label
                  htmlFor="university"
                  className="flex items-center gap-2 text-xs font-bold text-white"
                >
                  <Building2 className="h-3 w-3" />
                  University
                </label>
                <select
                  id="university"
                  required
                  value={formData.universityId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      universityId: e.target.value,
                      facultyId: "",
                    });
                  }}
                  className="input-primary h-9 w-full bg-white/90 text-sm backdrop-blur-sm transition-all focus:bg-white"
                  disabled={isLoading || universitiesLoading}
                >
                  <option value="">Select university</option>
                  {universities?.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Faculty - Col 2 */}
              <div className="space-y-1">
                <label
                  htmlFor="faculty"
                  className="flex items-center gap-2 text-xs font-bold text-white"
                >
                  <Building2 className="h-3 w-3" />
                  Faculty
                </label>
                <select
                  id="faculty"
                  required
                  value={formData.facultyId}
                  onChange={(e) =>
                    setFormData({ ...formData, facultyId: e.target.value })
                  }
                  className="input-primary h-9 w-full bg-white/90 text-sm backdrop-blur-sm transition-all focus:bg-white"
                  disabled={isLoading || !formData.universityId}
                >
                  <option value="">Select faculty</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student ID Upload - Full Width */}
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-white">
                  Student ID Photo
                </label>
                <p className="text-xs text-purple-200">
                  Upload a clear photo of your student ID for verification
                </p>
                <div>
                  {!studentIdUrl ? (
                    <UploadDropzone
                      endpoint="studentIdUploader"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]?.url) {
                          setStudentIdUrl(res[0].url);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setError(`Upload failed: ${error.message}`);
                      }}
                      appearance={{
                        container:
                          "border-2 border-dashed border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10 transition-colors rounded-lg",
                        uploadIcon: "text-purple-300",
                        label: "text-white font-medium text-sm",
                        allowedContent: "text-purple-200 text-xs",
                        button:
                          "bg-white text-purple-700 font-medium px-3 py-1 text-sm rounded-md hover:bg-white/90 ut-ready:bg-white ut-uploading:bg-white/50",
                      }}
                    />
                  ) : (
                    <div className="rounded-lg border border-green-500/50 bg-green-500/20 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-200">
                          ✓ Student ID uploaded
                        </span>
                        <button
                          type="button"
                          onClick={() => setStudentIdUrl("")}
                          className="text-xs text-red-300 hover:text-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !studentIdUrl}
                className="group/btn relative col-span-2 h-10 w-full overflow-hidden rounded-lg bg-white text-sm font-bold text-purple-700 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-visible:ring-4 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {/* Button shimmer */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-200 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />

                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-purple-700 border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-4 text-center">
              <p className="text-xs text-purple-100">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-white underline decoration-2 underline-offset-2 transition-all hover:text-yellow-300 hover:decoration-yellow-300"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs font-medium text-white/80">
          © {new Date().getFullYear()} UNIShare. All rights reserved.
        </p>
      </div>
  );
}
