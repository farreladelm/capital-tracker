"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import FormField from "./FormField";

export default function LoginForm() {
  const [state, action, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      return await login(formData);
    },
    null
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <div
          role="alert"
          className="rounded-xl bg-error-container px-4 py-3 text-sm font-body text-on-error-container border border-error/20"
        >
          {state.error}
        </div>
      )}

      <FormField
        id="login-email"
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        disabled={isPending}
      />

      <FormField
        id="login-password"
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        disabled={isPending}
      />

      <button
        id="login-submit"
        type="submit"
        disabled={isPending}
        className="mt-1 w-full rounded-full bg-primary py-4 font-headline font-bold text-on-primary transition-all hover:opacity-90 active-press disabled:opacity-40 text-[15px] tracking-[-0.01em] min-h-14"
      >
        {isPending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
