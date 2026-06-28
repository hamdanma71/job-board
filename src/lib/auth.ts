import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null; // User not found
        }

        // Compare hashed password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          return null; // Invalid password
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  // Quiet the benign JWT_SESSION_ERROR ("decryption operation failed"): it just
  // means the request carried a stale/invalid session cookie (e.g. issued under a
  // previous NEXTAUTH_SECRET). NextAuth already resolves the session to null, so
  // it is not an actionable server error — all other logs are preserved.
  logger: {
    error(code, ...rest) {
      if (code === "JWT_SESSION_ERROR") return;
      console.error(`[next-auth][error][${code}]`, ...rest);
    },
    warn(code) {
      console.warn(`[next-auth][warn][${code}]`);
    },
    debug() {},
  },
};
