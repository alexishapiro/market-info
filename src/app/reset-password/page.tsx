'use client'
import { useState } from 'react';
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
import {useCreateRequestLog} from '@/lib/hooks/request-log';
import {toast} from '@/components/ui/use-toast';
import { type NextPage } from 'next';
import React from 'react';
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
          activityType: "RESET_PASSWORD",
          activityStatus: "IN_PROGRESS",
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
      <img className='mx-auto' src='/logo.png' alt="logo" width={200} height={200} />
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