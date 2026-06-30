"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await login(formData);
    },
    null
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          disabled={isPending}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          disabled={isPending}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
