import { ReactNode } from 'react'
import { cn } from "@/lib/utils"; 
import { Inter as FontSans } from 'next/font/google'

import { Yeseva_One } from 'next/font/google'
import { Poppins } from 'next/font/google'
 
import NextAuthSessionProvider from "@/components/SessionProvider";
import QueryClientProvider from "@/components/QueryClientProvider";
import { Toaster } from "@/components/ui/toaster";

type LayoutProps = {
  children: ReactNode
}

import '@/styles/globals.scss'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})
const fontHeading = Yeseva_One({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-heading',
})

const fontBody = Poppins({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-body',
})

export const metadata = {
  title: "Marketplace Info",
  description: "Perform a detailed retrieval search of the latest products and services from our marketplace.",
  keywords:"Marketplace, products, services, search, retrieve, luxury, exclusive, high-net-worth, individuals, bespoke, services.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className='dark'>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable, fontHeading.variable, fontBody.variable)}>
        <QueryClientProvider>
          <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}