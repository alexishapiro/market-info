import fs from 'fs/promises';
import path from 'path';
import { writeFileIfChanged } from './fileUtils';

const SERVER_DIR = path.join(process.cwd(), 'src', 'server');

const SERVER_FILES = [
  {
    path: 'auth.ts',
    content: `
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/server/db";
import { UserRole } from "@prisma/client";

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
        
        return { id: userFound.id, email: userFound.email, role: userFound.role as UserRole };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (user && account) {
        return true;
      } else {
        return false;
      }
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
`
  },
  {
    path: 'db.ts',
    content: `
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = db;
`}
];

async function generateServerFiles() {
  try {
    await fs.mkdir(SERVER_DIR, { recursive: true });
    await fs.mkdir(path.join(SERVER_DIR, 'api'), { recursive: true });

    for (const file of SERVER_FILES) {
      const filePath = path.join(SERVER_DIR, file.path);
      try {
        await fs.access(filePath);
        console.log(`File already exists: ${filePath}`);
      } catch (error) {
        writeFileIfChanged(filePath, file.content.trim());
        console.log(`Created file: ${filePath}`);
      }
    }

    console.log('Server files setup completed successfully!');
  } catch (error) {
    console.error('Error setting up server files:', error);
  }
}

generateServerFiles();