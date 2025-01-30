"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { trpc, trpcClient } from "@/utils/trpc.ts";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const TrpcProvider = trpc.Provider;
  return (
    <TrpcProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TrpcProvider>
  );
}
