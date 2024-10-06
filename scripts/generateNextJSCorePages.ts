import fs from 'fs/promises';
import path from 'path';
import { writeFileIfChanged } from './fileUtils';
const APP_DIR = path.join(process.cwd(), 'src', 'app');
const PAGES_DIR = path.join(process.cwd(), 'src', 'pages');
const COMPONENTS_DIR = path.join(process.cwd(), 'src', 'components');


async function generateNextJSCorePages() {
  try {
    // Ensure the app directory exists
    await fs.mkdir(APP_DIR, { recursive: true });

    // Generate layout.tsx
    await generateLayoutFile();
    
    // Generate home page
    await generateHomePage();
    // Generate login page
    await generateLoginPage();
    // Generate app page
    await generateAppPage();

    // Generate register page
    await generateRegisterPage();

    // Generate reset password page
    await generateResetPasswordPage();

    console.log('NextJS core pages generated successfully!');
  } catch (error) {
    console.error('Error generating NextJS core pages:', error);
  }
}

function generateResetPasswordPage() {
  const resetPasswordPageContent = `
'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { type NextPage } from 'next';
import React from 'react';
import { useCreateRequestLog } from '@/lib/hooks/request-log';
import { ActivityStatus, ActivityType } from '@prisma/client';
import '@/styles/reset-password.css';
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const ResetPasswordPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: createRequestLog } = useCreateRequestLog();
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    try {
      const data = await createRequestLog({
        data: {
          activityType: ActivityType.RESET_PASSWORD,
          activityStatus: ActivityStatus.IN_PROGRESS,
          activityMessage: values.email || 'No email provided',
        },
      });
      toast({
        title: 'Success',
        description: 'If an account exists with this email, a password reset request has been sent to our support team. We will be in contact with you shortly.',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

   
  return (
    <div className="container mx-auto max-w-md p-6" style={{  backgroundColor: "black",  backgroundBlendMode: "multiply",  opacity: "0.9", borderRadius: "1em", margin: "10% auto"}}>
      <h1 className="text-2xl text-center font-bold mb-6">Reset Password</h1>
      <img className='mx-auto' src='/museumLogoTRNS.png' alt="logo" width={200} height={200} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant="default" type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Create Request'}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <a href="/login" className="text-white hover:underline">
          Remember your password? Login
        </a>
      </div>
      <div className="mt-4 text-center">
        <a href="/register" className="text-white hover:underline">
          Don't have an account? Register
        </a>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

  `;
  writeFileIfChanged(path.join(APP_DIR, 'reset-password', 'page.tsx'), resetPasswordPageContent.trim());
  console.log('Generated: src/app/reset-password/page.tsx');
}

// function generatePagesAPP() {
//   const _appPageContent = `
// import type { AppProps } from 'next/app';
// import { SessionProvider } from 'next-auth/react';
// import { ThemeProvider } from 'next-themes';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import '../styles/globals.css';

// const queryClient = new QueryClient();

// function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
//   return (
//     <SessionProvider session={session}>
//       <QueryClientProvider client={queryClient}>
//         <ThemeProvider attribute="class" defaultTheme="dark">
//           <Component {...pageProps} />
//         </ThemeProvider>
//       </QueryClientProvider>
//     </SessionProvider>
//   );
// }

// export default MyApp;
//   `;
//   writeFileIfChanged(path.join('src','pages','_app.tsx'), _appPageContent);
// }
async function generateLayoutFile() {
  const layoutContent = `
import { ReactNode } from 'react'
import "@/styles/globals.css";
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
  title: "Prima Medical",
  description: "PRIMA is a comprehensive solution designed to revolutionize the way healthcare facilities operate. We integrates critical functions, including Electronic Medical Records (EMR), Online Booking System, Inventory Management, Accounting and Finance, Human Resource Management System (HRMS), and Medical Database Management.",
  keywords: "Healthcare management, Electronic Medical Records, Online Booking System, Inventory Management, Accounting and Finance, Human Resource Management, Medical Database Management, Healthcare facilities, Patient care, Healthcare technology, Integrated healthcare solutions",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" >
      <body className={cn('min-h-screen font-sans antialiased dark', fontSans.variable)}>
        <QueryClientProvider>
          <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}

`;

  writeFileIfChanged(path.join(APP_DIR, 'layout.tsx'), layoutContent.trim());
  console.log('Generated: src/app/layout.tsx');
}

async function generateLoginPage() {
  const loginPageContent = `
'use client'
import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { type NextPage } from 'next';
import { createHash } from 'crypto';
import { useQuery } from '@tanstack/react-query';

import { UserRole } from '@prisma/client';
import '@/styles/login.css';
import { navigateTo } from '@/lib/navigation-util';
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const SignIn: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const { toast } = useToast();


  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    const hashedPassword = createHash('sha256').update(values.password).digest('hex');
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: hashedPassword,
      });
      if(result?.error) {
        console.log('Login Failed', result);
        toast({
          title: 'Login Failed',
          description: 'User doesnt exist, please register',
          variant: 'destructive',
        });
      }

      if (!result?.error) {
        console.log('Login Successful', result);
        toast({
          title: 'Success',
          description: 'Login successful',
        });
      }
    } catch (error) {
      console.log('Login Failed', error);
      toast({
        title: 'Login Failed',
        description:'Error occurred: User requires to register for access',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session && status === 'authenticated') {
      navigateTo('/', '');
    }
  }, [session, status]);
   
  return (
    <div className="container mx-auto max-w-md p-6" style={{ backgroundColor: "black", backgroundBlendMode: "multiply", opacity: "0.9", borderRadius: "1em", margin: "10% auto" }}>
      <h1 className="text-2xl text-center font-bold mb-6">Login</h1>
      <img className='mx-auto' src='/primaLogo.png' alt="logo" width={200} height={200} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant="default" type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <a href="/register" className="text-white hover:underline">
          Don't have an account? Register
        </a>
      </div>
      <div className="mt-2 text-center">
        <a href="/reset-password" className="text-white hover:underline">
          Forgot password?
        </a>
      </div>
    </div>
  );
};

export default SignIn;
`;

  writeFileIfChanged(path.join(APP_DIR, 'login', 'page.tsx'), loginPageContent.trim());
  console.log('Generated: src/app/login/page.tsx');
}

async function generateRegisterPage() {
  const registerPageContent = `
'use client'
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { createHash } from 'crypto';
import { type NextPage } from 'next';
import { signOut } from 'next-auth/react';
import '@/styles/register.css';
import { navigateTo } from '@/lib/navigation-util';
const registerSchema = z.object({
  name: z.string().min(4, 'Name must be at least 4 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      // Register user
      if(values.password.length !== values.confirmPassword.length){
        throw new Error('Passwords do not match');
      }
      const hashedPassword = createHash('sha256').update(values.password).digest('hex');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({role: 'USER', email: values.email, password: hashedPassword, name: values.name}),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
        toast({
          title: 'Success',
          description: 'Registration successful. Please login.',
        });
        navigateTo('/login', '');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error occurred: Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-md p-6" style={{  backgroundColor: "black",  backgroundBlendMode: "multiply",  opacity: "0.9", borderRadius: "1em", margin: "10% auto"}}>
      <h1 className="text-2xl text-center font-bold mb-6">Register</h1>
      <img className='mx-auto' src='/primaLogo.png' alt="logo" width={200} height={200} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant="default" type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <a href="/login" onClick={() => {
          signOut({ callbackUrl: '/login' });
        }} className="text-white hover:underline">
          Already have an account? Login
        </a>
      </div>
    </div>
  );
};

export default Register;
`;

  writeFileIfChanged(path.join(APP_DIR, 'register', 'page.tsx'), registerPageContent.trim());
  console.log('Generated: src/app/register/page.tsx');
}
async function generateAppPage() {
  const appPageContent = `
'use client'
import { type NextPage } from "next";
import { AppShell } from "@/components/appShell";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useFindUniqueUser } from "@/lib/hooks/user";
import { useToast } from "@/components/ui/use-toast";
import { navigateTo } from "@/lib/navigation-util";

const PrimaApp : NextPage = () => {
  const { data: session, status } = useSession()
  const {data : userDB, isLoading : isDataLoading, isError : isErrorUser} = useFindUniqueUser({where : {id : session?.user?.id}, select : {id : true, role : true, email : true}})
  const { toast } = useToast();
  useEffect(() => {
    if (status === 'unauthenticated') {
      signOut({ callbackUrl: "/login" });
    } else if (status === 'authenticated' && !isDataLoading) {
      toast({
        title: 'Data loaded',
        description: 'Data has been loaded from the database',
      });
    }
  }, [status, isDataLoading])

    if (isErrorUser) {
    console.log('Error loading data from the database', isErrorUser)
    toast({
      title: 'Error',
      description: 'There was an error loading the data. Please try again.',
      variant: 'destructive',
    })
   }

  return (
    <>
      <AppShell>
      <div className="relative">
          <h1 className="text-4xl font-bold mb-6 px-4 py-2">Welcome to Prima Medical</h1>
          <img
            src="/primaLogo.png"
            alt="Prima Medical Logo"
            width={100}
            height={100}
            className="absolute top-0 right-0 m-4"
          />
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">About Prima Medical</h2>
            <div className="text-center mb-8">
              <p className="mb-6 text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Prima Medical is a comprehensive healthcare management solution designed to revolutionize the way healthcare facilities operate. Our integrated platform combines critical functions including:
              </p>
              <ul className="list-none space-y-2 mb-6">
                <li>Electronic Medical Records (EMR)</li>
                <li>Online Booking System</li>
                <li>Inventory Management</li>
                <li>Accounting and Finance</li>
                <li>Human Resource Management System (HRMS)</li>
                <li>Medical Database Management</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                By streamlining these essential processes into a single, user-friendly platform, PRIMA enhances operational efficiency, improves patient care, and optimizes resource management, empowering healthcare providers to focus on what truly matters: delivering exceptional patient outcomes.
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Join us in our journey to transform healthcare delivery and management, creating a more efficient, effective, and patient-centered healthcare ecosystem.
              </p>
              <button className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
};

export default PrimaApp;
`;
  writeFileIfChanged(path.join(APP_DIR, 'app', 'page.tsx'), appPageContent.trim());
  console.log('Generated: src/app/app/page.tsx');
}

 async function generateHomePage() {
  const homePageContent = `

  'use client'
  import { useSession, signOut } from "next-auth/react";
  import { useEffect } from "react";
  import { useToast } from "@/components/ui/use-toast";
  import { AppShell } from "@/components/appShell";
  import { Card } from "@/components/ui/card";
    
  
  const HomePage: React.FC = () => {
    const { data: session, status } = useSession();
    const { toast } = useToast();
    
  
    useEffect(() => {
      if (status === "unauthenticated") {
        signOut({ callbackUrl: "/login" });
      } else if (status === "authenticated") {
        toast({
          title: "Data loaded",
          description: "Data has been loaded from the database",
        });
      }
    }, [status]);
  
  
    if (!session) {
      return null;
    }
  
    return (
      <AppShell>
        <div className="relative">
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-opacity-90 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">About Prima Medical</h2>
            <Card className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-300">About Prima Medical</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 max-w-2xl mx-auto">
                Prima Medical is a comprehensive healthcare management solution designed to revolutionize the way healthcare facilities operate. Our integrated platform combines critical functions including:
              </p>
              <ul className="list-none space-y-2 mb-6 text-gray-700 dark:text-gray-300">
                <li>Electronic Medical Records (EMR)</li>
                <li>Online Booking System</li>
                <li>Inventory Management</li>
                <li>Accounting and Finance</li>
                <li>Human Resource Management System (HRMS)</li>
                <li>Medical Database Management</li>
              </ul>
            </Card>
            
            <Card className="bg-blue-50  p-6 rounded-lg mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-300">Our Mission</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By streamlining these essential processes into a single, user-friendly platform, PRIMA enhances operational efficiency, improves patient care, and optimizes resource management, empowering healthcare providers to focus on what truly matters: delivering exceptional patient outcomes.
              </p>
            </Card>
            
            <Card className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-300">Join Our Journey</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Join us in our journey to transform healthcare delivery and management, creating a more efficient, effective, and patient-centered healthcare ecosystem.
              </p>
              <button className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300 dark:hover:bg-blue-600">
                Get Started
              </button>
            </Card>
          </div>
        </div>
      </AppShell>
    );
  };
  
  export default HomePage;
`;
  writeFileIfChanged(path.join(APP_DIR, 'home', 'page.tsx'), homePageContent.trim());
  console.log('Generated: src/app/home/page.tsx');
}

// Call the function to generate Next.js core pages
generateNextJSCorePages();