
import { signOut } from "next-auth/react";
export const navigateTo = (path: string, id: string) => {
  if (path.startsWith("/login")) {
    signOut({ callbackUrl: '/login' });
  } else if (path.startsWith("/profile")) {
    if (id) {
      window.location.href = path + "/" + id;
    } else {
      window.location.href = path;
    }
  } else {
    window.location.href = path;
  }
};
