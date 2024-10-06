
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth";
import { db } from "@/server/db";


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

    window.location.href = "/login";
  }
  const maybeUser = await db.user.findFirst({
    where: { email: userEmail?.toLowerCase() }
  });
  if (!maybeUser) {
    window.location.href = "/login";
    return null;
  }
  const userrole = await db.userRole.findFirst({  
    where: { id: maybeUser.roleId }
  });
  userRole = userrole?.name;
  return userRole;
}
