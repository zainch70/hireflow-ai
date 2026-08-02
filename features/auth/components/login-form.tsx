"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { InlineAlert } from "@/components/layouts/inline-alert";
import { loginHrAction } from "@/features/auth/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionResult } from "@/types/auth";

const initialState: AuthActionResult = {};

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginHrAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  const formErrorId = state.error ? "login-form-error" : undefined;

  return (
    <form
      action={formAction}
      className="space-y-5"
      noValidate
      aria-busy={isPending}
      aria-describedby={formErrorId}
    >
      {redirectTo ? (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Work email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="hr@company.com"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
          disabled={isPending}
        />
        {state.fieldErrors?.email?.[0] ? (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            minLength={8}
            className="pr-10"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={
              state.fieldErrors?.password ? "password-error" : undefined
            }
            disabled={isPending}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 size-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => setShowPassword((open) => !open)}
            disabled={isPending}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {state.fieldErrors?.password?.[0] ? (
          <p
            id="password-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <InlineAlert>
          <span id={formErrorId}>{state.error}</span>
        </InlineAlert>
      ) : null}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Signing in…" : "Continue"}
      </Button>
    </form>
  );
}
