"use client";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </SupabaseProvider>
    </ThemeProvider>
  );
}
