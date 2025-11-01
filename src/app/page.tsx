import Link from "next/link";
import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-indigo-900 text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          UNI<span className="text-purple-400">Share</span>
        </h1>
        <p className="max-w-2xl text-center text-xl text-gray-300">
          Student-driven academic organization platform for universities
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {session?.user ? (
            <>
              {session.user.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="rounded-lg bg-purple-600 px-8 py-3 font-semibold transition hover:bg-purple-500"
                >
                  Admin Dashboard
                </Link>
              ) : session.user.role === "APPROVED" ? (
                <>
                  <Link
                    href="/courses"
                    className="rounded-lg bg-purple-600 px-8 py-3 font-semibold transition hover:bg-purple-500"
                  >
                    My Courses
                  </Link>
                  <Link
                    href="/articles"
                    className="rounded-lg border-2 border-purple-600 px-8 py-3 font-semibold transition hover:bg-purple-600/20"
                  >
                    Browse Articles
                  </Link>
                </>
              ) : (
                <Link
                  href="/waiting-approval"
                  className="rounded-lg bg-yellow-600 px-8 py-3 font-semibold transition hover:bg-yellow-500"
                >
                  Awaiting Approval
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg bg-purple-600 px-8 py-3 font-semibold transition hover:bg-purple-500"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border-2 border-purple-600 px-8 py-3 font-semibold transition hover:bg-purple-600/20"
              >
                Sign Up
              </Link>
              <Link
                href="/articles"
                className="rounded-lg border-2 border-gray-400 px-8 py-3 font-semibold transition hover:bg-gray-400/20"
              >
                Browse Articles
              </Link>
            </>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            Organize courses • Share resources • Collaborate on notes • Manage
            your timetable • Share articles
          </p>
        </div>
      </div>
    </main>
  );
}
