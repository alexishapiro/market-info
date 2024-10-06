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
      if(response.status === 200){
        toast({
          title: 'Registration successful',
          description: 'You can now login',
        });
        setIsLoading(false);
        navigateTo('/login', '');
      }
      else if(response.status === 400)  {
        toast({
          title: 'User already exists',
          description: 'Please try again',
          variant: 'destructive',
        });
        setIsLoading(false);
        navigateTo('/login', '');
      }
      else if(response.status === 401)  {
        toast({
          title: 'Registration failed',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
      else if(response.status === 403)  {
        toast({
          title: 'Registration failed',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
      else {
        toast({
          title: 'Registration failed',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
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
      <img className='mx-auto' src='/logo.png' alt="logo" width={200} height={200} />
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
          {/* <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
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
