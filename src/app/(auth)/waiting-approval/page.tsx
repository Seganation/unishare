"use client";

import { signOut } from "next-auth/react";

export default function WaitingApprovalPage() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Main Card */}
        <div className="rounded-lg bg-white p-8 shadow-xl">
          {/* Icon */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <span className="text-4xl">⏳</span>
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Account Pending Approval
            </h1>
            <p className="mb-6 text-gray-600">
              Your registration is currently under review by our admin team.
            </p>

            {/* Status Box */}
            <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-left">
              <h3 className="mb-2 font-semibold text-yellow-900">
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start">
                  <span className="mr-2">1️⃣</span>
                  <span>
                    Admin reviews your student ID and registration details
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2️⃣</span>
                  <span>Verification typically takes 24-48 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3️⃣</span>
                  <span>
                    You'll receive an email once your account is approved
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4️⃣</span>
                  <span>
                    After approval, you'll have full access to all features
                  </span>
                </li>
              </ul>
            </div>

            {/* Features Preview */}
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-left">
              <h3 className="mb-2 font-semibold text-blue-900">
                What you'll get access to:
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <span className="mr-2">📚</span>
                  <span>Create and organize courses</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🤝</span>
                  <span>Collaborate with classmates</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📝</span>
                  <span>Real-time collaborative notes</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📅</span>
                  <span>Manage your timetable</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📄</span>
                  <span>Share resources and assignments</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <button
              onClick={handleSignOut}
              className="w-full rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Sign Out
            </button>

            {/* Help Text */}
            <p className="mt-4 text-xs text-gray-500">
              Questions? Contact us at support@unishare.com
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} UNIShare. All rights reserved.
        </p>
      </div>
    </div>
  );
}
