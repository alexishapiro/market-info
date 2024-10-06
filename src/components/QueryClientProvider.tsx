"use client";

import { dehydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFindUniqueUser } from "@/lib/hooks/user";
type Props = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

function Provider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default Provider;