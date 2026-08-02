"use client";

import { useActionState } from "react";

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
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          minLength={8}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          disabled={isPending}
        />
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
