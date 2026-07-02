"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";

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
        <div className="rounded bg-error-container p-3 text-sm font-body text-on-error-container">
          {state.error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-xs font-label uppercase tracking-wider text-on-surface-variant">
          Name
        </label>
        <input
          name="name"
          type="text"
          disabled={isPending}
          className="w-full rounded border-[1.5px] border-outline-variant bg-surface px-4 py-3 font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
          placeholder="Optional"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-label uppercase tracking-wider text-on-surface-variant">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          disabled={isPending}
          className="w-full rounded border-[1.5px] border-outline-variant bg-surface px-4 py-3 font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-label uppercase tracking-wider text-on-surface-variant">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          disabled={isPending}
          className="w-full rounded border-[1.5px] border-outline-variant bg-surface px-4 py-3 font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full rounded bg-primary py-3 font-headline font-bold text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container active-press disabled:opacity-50"
      >
        {isPending ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
