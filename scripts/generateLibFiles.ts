import fs from 'fs/promises';
import path from 'path';
import { writeFileIfChanged } from './fileUtils';
const LIB_DIR = path.join(process.cwd(), 'src', 'lib');

async function generateLibFiles() {
  try {
    // Ensure the lib directory exists
    await fs.mkdir(LIB_DIR, { recursive: true });

    // Get the ZenStack schema
    const schema = await getZenStackSchema();

    // Generate or update files based on the schema
    await generateApiFile(schema);
    await generateAuthFile(schema);
    await generateUtilsFile(schema);
    await generateAuthOptionFile();
    await generatePrismaFile();

    console.log('src/lib/ files generated or updated successfully!');
  } catch (error) {
    console.error('Error generating src/lib/ files:', error);
  }
}

async function getZenStackSchema() {
  try {
    const schemaPath = path.join(process.cwd(), 'schema.zmodel');
    const schemaContent = await fs.readFile(schemaPath, 'utf-8');
    return schemaContent;
  } catch (error) {
    console.error('Error reading ZenStack schema:', error);
    return '';
  }
}

async function generateApiFile(schema: string) {
  const apiFilePath = path.join(LIB_DIR, 'api.ts');
  const modelNames = extractModelNames(schema);

  let content = `
import { useQuery } from '@tanstack/react-query';

${modelNames.map(name => `
export const fetch${name}s = async () => {
  const res = await fetch('/api/${name.toLowerCase()}s');
  return res.json();
};

export const use${name}s = () => {
  return useQuery({
    queryKey: ['${name.toLowerCase()}s'],
    queryFn: fetch${name}s,
  });
};
`).join('\n')}

// Helper function to handle API errors
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  throw new Error(error.message || 'Issue with the API, user requires to register for access');
};
`;

  await writeFileIfChanged(apiFilePath, content);
  console.log(`Generated/Updated: ${apiFilePath}`);
}

async function generateAuthFile(schema: string) {
  const authFilePath = path.join(LIB_DIR, 'auth.ts');
  const content = `
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth";
import { db } from "@/server/db";
import { UserRole } from "@prisma/client";
import { signOut } from 'next-auth/react';
import { navigateTo } from '@/lib/navigation-util';

export async function auth() {
  return await getServerSession(authOptions);
}

export async function getUserEmail() {
  const session = await auth();
  return session?.user?.email;
}

export async function getUserId() {
  const session = await auth();
  return session?.user?.id;
}

export async function getUserName() {
  const session = await auth();
  return session?.user?.name;
}

export async function getUserRole() {

  const session = await auth();
  let userEmail = session?.user?.email;
  let userRole = null;
  if (!userEmail) {
    navigateTo("/login",'');
  }
  const maybeUser = await db.user.findFirst({
    where: { email: userEmail?.toLowerCase() },
    select: { role: true }
  });
  if (!maybeUser) {
    signOut({ callbackUrl: '/login' });
    return null;
  }
  userRole = maybeUser?.role as UserRole;
  return userRole;
}
`;

  await writeFileIfChanged(authFilePath, content);
  console.log(`Generated/Updated: ${authFilePath}`);
}

// async function generateMiddlewareFile() {
//   const middlewareFilePath = path.join(LIB_DIR, 'middleware.ts');
//   const content = `
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getUserRole } from './auth';
// import { getToken } from 'next-auth/jwt';
// import { UserRole } from '@prisma/client';
// import { db } from '@/server/db';

// export async function middleware(request: NextRequest) {
//   const response = NextResponse.next();
//   const path = request.nextUrl.pathname;
//   const session = !!request.cookies.get("next-auth.session-token");
//   const role = await getUserRole();

//   // Add security headers
//   response.headers.set('X-XSS-Protection', '1; mode=block');
//   response.headers.set('X-Frame-Options', 'DENY');
//   response.headers.set('X-Content-Type-Options', 'nosniff');
//   response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
//   response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

//   // Content Security Policy
//   response.headers.set(
//     'Content-Security-Policy',
//     "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
//   );

//   // Additional security headers for mobile and desktop applications
//   response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
//   response.headers.set('Expect-CT', 'max-age=86400, enforce');
//   response.headers.set('Feature-Policy', "geolocation 'self'; microphone 'none'; camera 'none'");

//   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
//   const { pathname } = request.nextUrl;

//   // Define your route permissions here
//   const routePermissions: { [key: string]: UserRole[] } = {
//     '/operations': ['ADMIN', 'OPS'],
//     '/profile': ['USER', 'ADMIN', 'OPS'],
//     '/reservations': ['USER', 'ADMIN', 'OPS'],
//     '/': ['USER', 'ADMIN', 'OPS'],
//   };

//   if (!token && pathname !== '/login') {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   if (token) {
//     const userRole = token.role as UserRole;
//     const allowedRoles = routePermissions[pathname];

//     if (allowedRoles && !allowedRoles.includes(userRole)) {
//       return NextResponse.redirect(new URL('/unauthorized', request.url));
//     }
//   }

//   return response;
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)','/operations/:path*', '/profile/:path*','/reservations/:path*', '/'
//   ],
// };
// `;

//   await writeFileIfChanged(middlewareFilePath, content);
//   console.log(`Generated/Updated: ${middlewareFilePath}`);
// }

async function generateUtilsFile(schema: string) {
  const utilsFilePath = path.join(LIB_DIR, 'utils.ts');
  const content = `

  import { Prisma, UserRole } from '@prisma/client';
  import { z } from 'zod';
  import appStructure from './appStructure.json';
  import appStructureControl from '@/data/app-structure-control.json';
  import { ClassValue } from 'class-variance-authority/types';
  import { twMerge } from 'tailwind-merge';
  import { clsx } from 'clsx';
  import { signOut } from 'next-auth/react';
  export interface Field {
    name: string;
    type: string;
    isArray?: boolean;
    isOptional?: boolean;
    isRequired: boolean;
    isUnique: boolean;
    isId: boolean;
    isList: boolean;
    isIgnore: boolean;
    isOmit: boolean;
    isEnum: boolean;
    isRelation: boolean;
    isRelationOwner: boolean;
    isRelationMany: boolean;
    relationType: string;
    relatedModel: string;
    relationFields: string[];
    relationReferences: string[];   
  }
  
  interface Model {
    name: string;
    fields: Field[];
  }
  
  interface AppStructure {
    models: Model[];
  }
  export const isNonDesktopDevice = () => {
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent;
      return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(userAgent);
    }
    return false;
  };
  
  export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs))
  }
    
  export const isAuthorized = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(userRole);
  };
  
  
  export function getRequiredFields(schema: z.ZodObject<any>) {
    const shape = schema.shape;
    const requiredFields: string[] = [];
  
    for (const [key, value] of Object.entries(shape)) {
      if (value instanceof z.ZodString || value instanceof z.ZodNumber) {
        if (!value.isOptional()) {
          requiredFields.push(key);
        }
      }
    }
    return requiredFields;
  }
  
  export const getMandatoryFields = (modelName: string): any[] => {
    const forms = appStructureControl.components.forms.find((comp: any) => comp.model === modelName);
    if (!forms) return [];
    const fieldsIncluded = forms.fields;
    const model = appStructure.models.find((model: any) => model.name === modelName);
    if (!model) return [];
    const fields = model.fields.filter((field: any) => fieldsIncluded.includes(field.name));
    return fields;
  };
  
  export function generateDynamicFields<T extends z.ZodTypeAny>(
    form: Record<string, any>,
    schema: T,
    operation: 'create' | 'update'
  ): Record<string, Prisma.InputJsonValue | typeof Prisma.JsonNull> {
    return Object.fromEntries(
      Object.entries(form).map(([key, value]) => {
        if (typeof schema === 'object' && 'shape' in schema && schema.shape) {
          const field = schema.shape[key as keyof typeof schema.shape];
          if (field && typeof field === 'object' && 'typeName' in field) {
            switch ((field as z.ZodTypeAny)._def.typeName) {
              case 'ZodDate':
              case 'ZodDateTime':
                return [key, value ? new Date(value as string) : null];
              case 'ZodString':
              case 'ZodCuid':
              case 'ZodUuid':
                return [key, String(value)];
              case 'ZodNumber':
              case 'ZodInt':
              case 'ZodFloat':
                return [key, Number(value)];
              case 'ZodBoolean':
                return [key, Boolean(value)];
              case 'ZodEnum':
                return [key, value];
              case 'ZodObject':
                if (operation === 'create') {
                  return [key, { create: value }];
                } else {
                  return [key, { connect: { id: value } }];
                }
              case 'ZodArray':
                if (Array.isArray(value)) {
                  return [key, { set: value }];
                } else {
                  return [key, { set: [value] }];
                }
              case 'ZodOptional':
                if (value === undefined || value === null) {
                  return [key, null];
                }
                return generateDynamicFields({ [key]: value }, (field as z.ZodOptional<z.ZodTypeAny>)._def.innerType, operation);
              default:
                return [key, value as Prisma.InputJsonValue];
            }
          }
        }
        return [key, value];
      }).filter((entry): entry is [string, Prisma.InputJsonValue] => entry !== undefined)
    );
  }
  
  function generateDynamicFormDataSubmission(formData: any, modelName: string): { [key: string]: Prisma.InputJsonValue | typeof Prisma.JsonNull } {
    const submissionObject: { [key: string]: Prisma.InputJsonValue | typeof Prisma.JsonNull } = {};
    console.log(formData);  
    // Iterate through all fields in the formData
    for (const [key, value] of Object.entries(formData)) {
      submissionObject[key] = value as Prisma.InputJsonValue | typeof Prisma.JsonNull;
    }
    return submissionObject;
    } 
  
  function getInputType(field: Field): string {
    switch (field.type.toLowerCase()) {
      case 'string':
        return 'text';
      case 'number':
      case 'integer':
      case 'decimal':
      case 'int':
        return 'number';
      case 'boolean':
        return 'checkbox';
      case 'date':
        return 'date';
      case 'datetime':
        return 'datetime-local';
      case 'time':
        return 'time';
      case 'email':
        return 'email';
      case 'url':
        return 'url';
      case 'enum':
        return 'select';
      case 'AppointmentStatus':
        return 'select';
      case 'MedicalCondition':
        return 'select';
      case 'VitalSigns':
        return 'select';
      case 'SOAPNote':
        return 'select';
      case 'Drug':
        return 'select';
      case 'Inventory':
        return 'select';
      case 'Prescription':
        return 'select';
      case 'UserRole':
        return 'select';
      case 'User':
        return 'select';
      case 'Doctor':
        return 'select';
      case 'Nurse':
        return 'select';
      case 'Pharmacist':
        return 'select';
      case 'Patient':
        return 'select';
      case 'Bill':
        return 'select';
      case 'BillStatus':
        return 'select';
      case 'Appointment':
        return 'select';
      default:
        return 'text';
    }
  }

`;

  await writeFileIfChanged(utilsFilePath, content);
  console.log(`Generated/Updated: ${utilsFilePath}`);
}


async function generatePrismaFile() {
  const prismaFilePath = path.join(LIB_DIR, 'prisma.ts');
  const content = `
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (typeof window === 'undefined') {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
} else {
  prisma = new PrismaClient();
}
`;

  await writeFileIfChanged(prismaFilePath, content);
  console.log(`Generated/Updated: ${prismaFilePath}`);
}

async function generateAuthOptionFile() {
  const authOptionFilePath = path.join(LIB_DIR, 'auth-options.ts');
  const content = `
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
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
`;

  await writeFileIfChanged(authOptionFilePath, content);
  console.log(`Generated/Updated: ${authOptionFilePath}`);
}

export function extractModelNames(schema: string): string[] {
  const modelRegex = /model\s+(\w+)\s*{/g;
  const matches = Array.from(schema.matchAll(modelRegex));
  return matches.map(match => match[1]);
}

generateLibFiles();