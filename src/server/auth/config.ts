import { compare } from "bcryptjs";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import { type Role } from "@prisma/client";

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
        if (!credentials?.email || !credentials?.password) {
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
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await compare(password, user.password);

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
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.facultyId = token.facultyId as string;
        session.user.universityId = token.universityId as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
