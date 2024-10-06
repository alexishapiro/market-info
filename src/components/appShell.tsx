'use client'

import { Sidebar } from "@/components/sidebar";
import { NavbarPro } from  "@/components/navbarpro";
 
import { useState, useEffect, ReactNode } from "react";
import { isNonDesktopDevice} from "@/lib/utils";
export interface AppShellProps {
  children: ReactNode;
}
export const AppShell = ({ children }: AppShellProps) => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
     
    if(typeof navigator != 'undefined'){
      const userAgent = navigator.userAgent;
      let currentMobileTest =  /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(userAgent)
      setIsMobile( currentMobileTest);
      console.log(isMobile, currentMobileTest, "isMobileisMobileisMobiles")
    }else{
      setIsMobile(false);
    } 
     
  
}, []);
  return (
  
  <div className="bg-muted/40 flex min-h-screen w-full">
    <Sidebar />
      <div className="container main-container  " style={{  marginLeft:   !isMobile  ? "300px " : "0px"    }} >
        <NavbarPro />
          <main className="flex-root" style={{paddingBottom:"60px"}}>
            {children}
          </main>
      </div>
  </div>
)};
