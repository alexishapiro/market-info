import fs from 'fs/promises';
import path from 'path';
import { writeFileIfChanged } from './fileUtils';
const API_DIR = path.join(process.cwd(), 'src', 'app', 'api');

const API_ROUTES = [
  { 
    path: 'auth/[...nextauth]/route',
    content: `
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

const handler = NextAuth(authOptions);
 
export { handler as GET, handler as POST };
`
  },
  {
    path: 'model/[...path]/route',
    content: `
    import { auth } from '@/lib/auth';
    import { enhance } from "@zenstackhq/runtime";
    import { NextRequestHandler } from "@zenstackhq/server/next";
    import { db } from "@/server/db";
    
    async function getPrisma() {
      const session = await auth();
      try {
        const prisma = enhance(db, { 
          user: session?.user?.id ? { id: session?.user?.id } : undefined 
        });
        if(prisma === undefined) {
          return null;
        }
        return prisma;
      } catch (error) {
        console.error('Error enhancing Prisma client:', error);
        return null;
      }
    }
    
    const handler = NextRequestHandler({ getPrisma, useAppDir: true });
    
    export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
`
  },
  {
    path: 'auth/register/route',
    content: `
'use server'
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { z } from 'zod';
import { Gender, UserRole } from "@prisma/client";

const membershipTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  minValue: z.number(),
  maxValue: z.number(),
  expiration: z.number(),
});

export async function POST(req: Request) {
  const { email, password, name, role } = await req.json();
  let emailAttr = email;
  let passwordAttr = password;
  let nameAttr = name;
  let roleAttr = role;

  let userCreated = null;
  let memberUser = null;
  let accountUser = null;

  try {
    userCreated = await db.user.create({
      data: {
        email: emailAttr,
        password: passwordAttr,
        name: nameAttr,
        age: 0,
        role: role as UserRole,
      }
    });
    if (!userCreated) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'User creation failed' + error }, { status: 500 });
  }

  try {
    let userExists = await db.profile.findFirst({
      where: {
        userId: userCreated?.id || '',
      },
      select: {
        id: true,
      }
    });
    let newUsername = nameAttr;
    if (userExists) {
      nameAttr = nameAttr + Math.floor(Math.random() * 100000).toString();
      console.log("newUsername assigned", newUsername);
    }
    memberUser = await db.profile.create({
      data: { 
        userId: userCreated?.id || '',
        firstName: nameAttr,
        lastName: nameAttr,
        dateOfBirth: new Date(),
        gender: Gender.UNKNOWN,
        address: '',
        phone: '',
      }
    });
    if (!memberUser) {
      return NextResponse.json({ error: 'Member user creation failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Member user creation failed' + error }, { status: 500 });
  }
}
`
  },
];

async function generateApiRoutes() {
  try {
    for (const route of API_ROUTES) {
      const routePath = path.join(API_DIR, `${route.path}.ts`);
      await writeFileIfChanged(routePath, route.content.trim());
    }
    console.log('API routes setup completed successfully!');
  } catch (error) {
    console.error('Error setting up API routes:', error);
  }
}

generateApiRoutes();