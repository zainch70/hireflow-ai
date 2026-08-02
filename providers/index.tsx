"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "@/providers/theme-provider";

/**
 * Root providers — keep the client boundary small.
 *
 * ThemeProvider stays: enables `class`-based dark mode via system preference
 * (design tokens already define `.dark`). No theme toggle UI yet.
 *
 * Opt-in later (do not mount globally until needed):
 * - Toaster (`components/ui/sonner`) when a feature calls toast()
 * - Supabase browser client via `lib/supabase/client` inside a Client Component
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
