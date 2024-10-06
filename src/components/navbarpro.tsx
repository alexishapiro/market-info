
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import IconComponent from '@/components/IconComponent'; 
import {
  BellIcon,
  DoorOpen as DoorOpenIcon,
  KeyIcon,
  MenuIcon,
  SettingsIcon,
  Shirt,
  XIcon,
  HomeIcon,
  CreditCardIcon,
  CircleUserRound as UserIcon,
  LogOut as LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { isNonDesktopDevice } from "@/lib/utils";
import navData from "@/data/appnav.json";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useFindUniqueUser } from "@/lib/hooks/user";
// import { LoadingAnimation } from "./loading";
import { toast } from "./ui/use-toast";
const iconMap = {
  KeyIcon,
  DoorOpenIcon,
  Shirt,
  SettingsIcon,
  XIcon,
  MenuIcon,
  HomeIcon,
  CreditCardIcon,
  BellIcon,
  UserIcon,
  LogOutIcon,
};

export interface NavbarProps {
  children: ReactNode;
}
export const NavbarPro = () => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathnameWithoutParams = pathname.split('?')[0];
  const { data: session, status } = useSession();
  const { data: userDB, isLoading: isDataLoading, isError } = useFindUniqueUser({
    where: { id: session?.user?.id },
    select: { id: true, role: true, email: true }
  });
  const userRole = userDB?.role as UserRole;
  let filteredNavItems = navData.navItems.filter((item) => 
    item.roles.includes(userRole.name) || item.roles.includes('ALL')
  );
  let currentItemSelected = filteredNavItems.find(item => 
    pathnameWithoutParams.includes(item.path)
  );
  let currentItem = currentItemSelected?.name ?? '';
  useEffect(() => {
    if (status === 'authenticated') {
      if (currentItem) {
        setActiveItem(currentItem);
      }
    }
  }, [currentItem]);
  useEffect(() => {
    const handleResize = () => {
      if (!isNonDesktopDevice()) {
        setIsMobileMenuOpen(true);
      }
      else {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);  
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
      if (!isNonDesktopDevice()) {
        setIsMobileMenuOpen(false);
      } else {
        setIsMobileMenuOpen(true);
      }
  }, []);

  
  if (isError ) {
    return <div>Error loading data. Please refresh the page.</div>
  }
  if (isError) {
    toast({
      title: 'Error',
      description: 'There was an error loading the data. Please try again.',
      variant: 'destructive',
    })
    return <div>Error loading data. Please refresh the page.</div>
  }
  return (
    <>
    <header className="bg-background border-b sticky   z-30 flex h-14 items-center  justify-between px-4 py-2" style={{'top':'-1px'}}>
           
  {/*  <div className="md:hidden lg:hidden ">
      <Sheet>
        <SheetTrigger asChild> */}
          
         {/* </SheetTrigger>
        <SheetContent side="left" className="sm:show w-56 md:hidden lg:hidden">
          <nav className="grid gap-6 text-lg font-medium">
            {filteredNavItems.map((item, index) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              
              return Icon ? (
                
                <Link
                  key={item.name}
                  href={item.path}
                  className={`hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    activeItem === item.name ? "text-primary" : "text-muted-foreground"
                  }`}
                  prefetch={false}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(item.path, session?.user?.id ?? '');
                  }}
                >
                  <Icon className="h-6 w-6" />
                  {item.name}
                </Link>
              ) : null;
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div> */}
  
    <div className="ml-auto flex items-center gap-2 sm:gap-4">
      {/* <Button variant="outline" size="icon" className="rounded-full">
        <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="sr-only">Notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <img
              src="/museumLogo.svg"
              width={32}
              height={32}
              alt="Avatar"
              className="rounded-full"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="align-end">
          
          {navData.profileMenu.map((item) => (
            <DropdownMenuItem key={item.name}>
                <Button variant="outline" className=" mt-2w-full" onClick={() => {
                  if (item.name === 'Logout') {
                    signOut({ callbackUrl: '/login' });
                  } else {
                    navigateTo(item.path, session?.user?.id ?? '');
                  }
                }}>

                  {item.name}
                </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu> */}
    </div>
    </header>
    </>
  )
}

export default dynamic(() => Promise.resolve(NavbarPro), { ssr: false });