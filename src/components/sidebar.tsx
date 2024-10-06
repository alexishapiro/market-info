'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect, ReactNode } from "react";
import navData from "@/data/appnav.json";
import { signOut, useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import IconComponent from '@/components/IconComponent'; 
import { usePathname } from "next/navigation";

import { useFindUniqueUser } from "@/lib/hooks/user";
import {
  HomeIcon,
  CalendarIcon,
  MapPinIcon,
  CreditCardIcon,
  UserPlusIcon,
  DollarSignIcon,
  BarChartIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  X as XIcon,
  ArrowRight as ArrowRightIcon,
  CircleUserRound as UserIcon,
  LogOut as LogOutIcon,
  DoorOpen as DoorOpenIcon,
  Castle as CastleIocn,
  ArrowLeftRight as ArrowLeftRightIcon,
  Package as PackageIcon,
  SquareUser as SquareUserIcon,
  Scroll as ScrollIcon,
  Plus as PlusIcon,
  Minus as MinusIcon
} from "lucide-react";

const iconMap: { [key: string]: React.ElementType } = {
  HomeIcon,
  CalendarIcon,
  MapPinIcon,
  CreditCardIcon,
  UserPlusIcon,
  DollarSignIcon,
  BarChartIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  ArrowRightIcon,
  UserIcon,
  LogOutIcon,
  DoorOpenIcon,
  CastleIocn,
  ArrowLeftRightIcon,
  PackageIcon,
  SquareUserIcon,
  ScrollIcon,
  PlusIcon,
  MinusIcon 
  
};
export interface MenuProps {
  children: ReactNode;
}

export const Sidebar = () => {
  const pathname = usePathname() || "/";
  const { data: session, status } = useSession()
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [currentItem, setCurrentItem] = useState('');
  const {data : userDB, isLoading : isDataLoading, isError} = useFindUniqueUser({where : {id : session?.user?.id}})
  const [activeItem, setActiveItem] = useState('');
  const [activeChildItem, setActiveChildItem] = useState('');
  const [currentItemSelected, setCurrentItemSelected] = useState({icon:'', name:''});
  const [currentChildItemSelected, setCurrentChildItemSelected] = useState({icon:'', name:''});
  const [isMenuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (status === 'unauthenticated') {
      signOut({ callbackUrl: '/login' });
    } else if (status === 'authenticated' && !isDataLoading) {
      setIsLoading(false)
    }
  }, [status, isDataLoading])
  
  useEffect(() => {
    const currentItem = navData.navItems.find((item) => pathname.includes(item.path) )?.name ?? '';
    let currentItemSelected:any = navData.navItems.find((item) => pathname.includes(item.path) );
    let currentChildItem = currentItemSelected?.children.find((child:any) => pathname.includes(child.path) )?.name ?? '';
      if(currentChildItem){
        let currentChildItemSelected = currentItemSelected?.children.find((child:any) => pathname.includes(child.path) );
        expanded[currentItem] = true
        setActiveChildItem(currentChildItem);
        setCurrentItemSelected(currentItemSelected)
        setCurrentChildItemSelected(currentChildItemSelected)
      }else{
        if (currentItem) {
          setActiveItem(currentItem);
          setCurrentItemSelected(currentItemSelected)
        }
      }
   
     
     
    
     
  }, [pathname]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (isMobile) {
  //       setMenuOpen(false);
  //     } else {
  //       setMenuOpen(true);
  //     }
  //   };
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);
   
  
  useEffect(() => {
     
    if(typeof navigator != 'undefined'){
      const userAgent = navigator.userAgent;
      let currentMobileTest =  /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(userAgent)
      setIsMobile(currentMobileTest);
      if(currentMobileTest ){
        setMenuOpen(!isMenuOpen)
      } 
      console.log(isMenuOpen, currentMobileTest, "isMobileisMobileisMobiles");
      
    }else{
      
      setIsMobile(false);
    } 
     
  
}, []);
  if (isError) {
    toast({
      title: 'Error',
      description: 'There was an error loading the data. Please try again.',
      variant: 'destructive',
    })
    return <div>Error loading data. Please refresh the page.</div>
  }
  const userRole = userDB?.roleId as string
  const isActive = (item: any) => {
    return activeItem === item.name;      
  };
    
  let filteredNavItems = navData.navItems.filter(item => 
    item?.roles.includes(userRole) || item?.roles.includes('ALL')
  );
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  // Toggle expand/collapse for a section
  const toggleExpand = (name: string) => {
    setExpanded((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
      
  }
  const handleItemClick = (item: any) => {
    if (item.name === 'Logout') {
      signOut({ callbackUrl: '/login' });
      
    } 
    setMenuOpen(false)
  };

  return (
    <>
      {/* Mobile menu button */}
      {/* <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-20 sm:hidden"
        onClick={() => setIsMobileMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <MenuIcon className="h-5 w-5" />
        ) : (
          <XIcon className="h-5 w-5" />
        )}
      </Button> */}
       
      {/* Sidebar for both mobile and desktop */}
      {isMobile && (
          <div  >
            <Button
              variant="outline"
              size="icon"
             className="fixed left-4 top-2 z-40 "
              onClick={() => setMenuOpen(!isMenuOpen)}
            >
                <MenuIcon style={{borderColor:'rgb(255, 255, 255);'}} className="h-5 w-5" />  
            </Button>
            <div className="fixed  top-4 w-full z-40 font-semibold " style={{left:'4.3rem'}}>
              {/* <IconComponent  className="inline-block mr-2 h-8 w-8"  iconName={currentItemSelected.icon}   />   */}
              <h3 className="inline-block   " style={{fontSize: 'clamp(1rem, 2vw, 1.5rem)'}}>{currentItemSelected.name}{currentChildItemSelected?.name ? ' / '+currentChildItemSelected?.name : ''}</h3>
              </div>
            </div>
            
          ) }
        <aside style={{'minWidth': isMobile   ? window.innerWidth:'300px'}}
          className={`bg-background   fixed    inset-y-0 left-0 z-40 flex-col border-r   transition-transform duration-300 ease-in-out   ${ isMobile && isMenuOpen ? "  sm:flex  -translate-x-full " : " translate-x-0"  }`}
        >
          <div className="flex h-[56px] items-center border-b px-1 ">
           
            <Link href="/home" className="flex items-center gap-2 font-semibold" onClick={() => setMenuOpen(false)}>
              <span   className="rounded-full">
                <img
                  src="/museumLogoTRNS.png"
                  width={45}
                  height={45}
                  alt="Avatar"
                  className="rounded-full"
                />
              </span>
              <span>Marketplace Info</span>
            </Link>
            {isMobile && (
              <span 
              className="absolute right-4 top-5 z-41  "
              onClick={() => setMenuOpen(!isMenuOpen)}
            >
                <XIcon className="h-5 w-5" />  
              </span>
          ) }
          </div>
          {/* <nav className={`flex-1 overflow-auto py-6  `}  > */}
            {/* <div className="grid gap-4 px-4"> */}
            <ul style={{'height':'calc(100% - 60px)', 'overflow':'auto'}}>
            
              {filteredNavItems.map((item) => {
                 
                 const isActive = activeItem === item.name;
                return (
                  // item.name === 'Logout' ? 
                  // <li key={item.name} >
                  // <span onClick={() => handleItemClick(item)}  
                  //   title={item.path}
                  //   style={{'cursor':'pointer'}}
                  //   className={`flex items-center justify-start gap-3 px-3 py-2 transition-all ${
                  //     isActive
                  //       ? "bg-primary text-primary-foreground hover:bg-primary/40"
                  //       : "hover:text-primary"
                  //   } w-full`}
                  // >
                  //    <IconComponent iconName={item.icon}  />  
                  //   {item.name} 
                  // </span>
                  // </li>:
                   

                  <li key={item.name}  onClick={() =>    setMenuOpen(false)  }>
                    { !item.children || item.children.length === 0 ? ( 
                    <Link  href={item.path}   onClick={() =>  handleItemClick(item)    } className={`w-full flex items-center justify-start  ` }    >
                    <span className={`flex items-center justify-start gap-3 px-3 py-2 transition-all ${ isActive  ? "bg-primary text-primary-foreground hover:bg-primary/40" : "hover:text-primary" } w-full`} >
                      
                      <IconComponent className="h-6 w-6" iconName={item.icon}  />  
                      {item.name} 
                    </span>
                    </Link>): 
                    <>
                      <button   onClick={() =>    toggleExpand(item.name)  }   className={`w-full flex items-center justify-start  ` }    >
                        <span className={`flex items-center justify-start gap-3 px-3 py-2 transition-all  w-full`} >
                          
                          {expanded[item.name] ? <MinusIcon className="h-6 w-6" /> : <PlusIcon className="h-6 w-6" />}
                          {item.name} 
                        </span>
                      </button>
                      { item.children && expanded[item.name] && (
                        <ul className="  space-y-1">
                          {item.children.map((child:any) => (
                            
                            <li key={child.name}>
                              <Link href={child.path}   >
                                <span className={` block p-2  px-10 hover:bg-gray-700 flex items-center space-x-2 ${ activeChildItem === child.name ? "bg-primary text-primary-foreground hover:bg-primary/40" : "hover:text-primary" } `}>
                                  {/* Replace this with actual icons based on your icon library */}
                                  <IconComponent className="h-6 w-6" iconName={child.icon}  />
                                  <span  className="ml-10">{child.name}</span>
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        )} 
                      </> }
                  </li>
              
              
                );
              })}
            </ul>
          {/* </nav> */}
        </aside>
     

      
       
    </>
  );
};

export default Sidebar ;