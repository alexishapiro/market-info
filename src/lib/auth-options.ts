
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/server/db";
import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        
        const userFound = await db.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!userFound) {
          throw new Error("User " + credentials.email + " not found");
        }

        const passwordMatch = credentials.password === userFound.password;
        
        if (!passwordMatch) {
          throw new Error("Password does not match for " + credentials.email);
        }
        
        return { id: userFound.id, email: userFound.email };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (user && account) {
        return true;
      } else {
        return false; // Redirect to registration page if user doesn't exist
      }
    },
  },
  pages: {
    signIn: '/',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/login',
    newUser: '/register',
    
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
