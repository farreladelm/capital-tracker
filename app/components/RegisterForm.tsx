"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import FormField from "./FormField";

export default function RegisterForm() {
  const [state, action, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      return await register(formData);
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
        id="register-name"
        label={
          <>
            Name{" "}
            <span className="normal-case tracking-normal font-body text-[11px] text-outline">
              (optional)
            </span>
          </>
        }
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Your name"
        disabled={isPending}
      />

      <FormField
        id="register-email"
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        disabled={isPending}
      />

      <FormField
        id="register-password"
        label="Password"
        name="password"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        disabled={isPending}
        hint="At least 6 characters"
      />

      <button
        id="register-submit"
        type="submit"
        disabled={isPending}
        className="mt-1 w-full rounded-full bg-primary py-4 font-headline font-bold text-on-primary transition-all hover:opacity-90 active-press disabled:opacity-40 text-[15px] tracking-[-0.01em] min-h-14"
      >
        {isPending ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
