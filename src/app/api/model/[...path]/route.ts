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