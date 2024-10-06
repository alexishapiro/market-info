'use client'
import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
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
import '@/styles/login.css';
import { navigateTo } from '@/lib/navigation-util';
import { createHash } from 'crypto';
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const Login: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
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
        navigateTo('/', '')
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

   
  return (
    <div className="center mx-auto max-w-md p-6" style={{ backgroundColor: "black", backgroundBlendMode: "multiply", opacity: "0.9", borderRadius: "1em", margin: "10% auto" }}>
      <h1 className="text-2xl text-center font-bold mb-6">Login</h1>
      <img className='mx-auto' src='/logo.png' alt="logo" width={200} height={200} />
      <Form {...form}>
        <form className="space-y-4">
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
          <Button variant="default" onClick={form.handleSubmit(onSubmit)} className="w-full" >
             Login
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

export default Login;
