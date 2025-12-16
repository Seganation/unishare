import { compare } from "bcryptjs";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import { type Role } from "@prisma/client";
import { env } from "~/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      facultyId: string;
      universityId: string;
      avatarIndex: number;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    facultyId: string;
    universityId: string;
  }
}

// JWT types are inferred from the jwt callback
// No need to declare module "next-auth/jwt" as it causes type conflicts

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  // Trust host for NextAuth v5 (required for production and local development)
  trustHost: true,

  // Explicitly set the secret for JWT encoding/decoding
  secret: env.AUTH_SECRET,

  // Use JWT strategy instead of database sessions for credentials provider
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] Authorize called with:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          throw new Error("Missing email or password");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await db.user.findUnique({
          where: { email },
          include: {
            university: true,
            faculty: true,
          },
        });

        if (!user) {
          console.log("[AUTH] User not found:", email);
          throw new Error("Invalid email or password");
        }

        console.log("[AUTH] User found:", { id: user.id, email: user.email });

        const isPasswordValid = await compare(password, user.password);

        console.log("[AUTH] Password valid:", isPasswordValid);

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.profileImage,
          role: user.role,
          facultyId: user.facultyId,
          universityId: user.universityId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.facultyId = user.facultyId;
        token.universityId = user.universityId;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[AUTH] Session callback called:", {
        hasSession: !!session,
        sessionType: typeof session,
        hasToken: !!token,
        tokenId: token?.id,
      });

      // In NextAuth v5 with JWT, session object might be minimal on first call
      // We need to ensure we always return a valid session structure
      if (!token?.id) {
        console.log("[AUTH] No token.id, returning session as-is");
        return session;
      }

      // Always fetch fresh user data from database to get latest profile info
      const { db } = await import("~/server/db");
      const freshUser = await db.user.findUnique({
        where: { id: token.id as string },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          facultyId: true,
          universityId: true,
          avatarIndex: true,
        },
      });

      if (!freshUser) {
        console.log("[AUTH] User not found in DB for token.id:", token.id);
        return session;
      }

      console.log("[AUTH] Building session for user:", freshUser.email);

      // Modify the existing session object instead of creating a new one
      // This is required for NextAuth v5 compatibility
      session.user = {
        id: freshUser.id,
        name: freshUser.name,
        email: freshUser.email ?? "",
        role: freshUser.role,
        facultyId: freshUser.facultyId,
        universityId: freshUser.universityId,
        avatarIndex: freshUser.avatarIndex,
      };

      console.log("[AUTH] Returning session:", {
        expires: session.expires,
        userId: session.user.id,
      });

      return session;
    },
  },
} satisfies NextAuthConfig;
