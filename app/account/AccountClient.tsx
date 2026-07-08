"use client";

import { useActionState, useState } from "react";
import FormField from "@/app/components/FormField";
import { updateProfile } from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import Link from "next/link";

type UserProfile = {
  name: string;
  email: string;
  currency: string;
};

type AccountClientProps = {
  user: UserProfile;
};

export function AccountClient({ user }: AccountClientProps) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await updateProfile(formData);
    },
    null
  );

  const [nameValue, setNameValue] = useState(user.name);

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header section */}
      <section className="text-left flex flex-col gap-1">
        <span className="font-label-sm text-primary uppercase tracking-wider">Account</span>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface">Settings</h1>
        <p className="font-body-md text-on-surface-variant">Personalization & settings</p>
      </section>

      {/* Notifications / Feedback */}
      {state?.error && (
        <div
          role="alert"
          className="rounded-xl bg-error-container px-4 py-3 text-sm font-body text-on-error-container border border-error/20 animate-in fade-in duration-200"
        >
          {state.error}
        </div>
      )}

      {state?.success && (
        <div
          role="alert"
          className="rounded-xl bg-green-100/80 dark:bg-green-950/30 px-4 py-3 text-sm font-body text-green-800 dark:text-green-400 border border-green-500/20 animate-in fade-in duration-200"
        >
          Changes saved successfully!
        </div>
      )}

      {/* Details & Form Card */}
      <div
        className="w-full rounded-3xl bg-surface-container-lowest border border-surface-variant/50 p-6 md:p-8 flex flex-col gap-6 soft-card-shadow"
      >
        {/* Email details (non-editable) */}
        <div className="flex flex-col gap-1.5 border-b border-surface-variant/30 pb-4">
          <span className="text-[11px] font-label-sm uppercase tracking-[0.06em] text-on-surface-variant select-none">
            Registered Email
          </span>
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-3 rounded-2xl">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70">
              mail
            </span>
            <span className="font-body text-on-surface text-sm">{user.email}</span>
          </div>
          <p className="pl-1 text-[11px] font-body text-outline">
            Login email is permanent and cannot be modified.
          </p>
        </div>

        {/* Base Currency (non-editable) */}
        <div className="flex flex-col gap-1.5 border-b border-surface-variant/30 pb-4">
          <span className="text-[11px] font-label-sm uppercase tracking-[0.06em] text-on-surface-variant select-none">
            Base Currency
          </span>
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-3 rounded-2xl">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70">
              payments
            </span>
            <span className="font-body text-on-surface text-sm font-semibold">
              {user.currency}
            </span>
          </div>
          <p className="pl-1 text-[11px] font-body text-outline">
            Chosen once during onboarding and cannot be changed.
          </p>
        </div>

        {/* Navigation / Manage Categories */}
        <div className="flex flex-col gap-1.5 border-b border-surface-variant/30 pb-4">
          <span className="text-[11px] font-label-sm uppercase tracking-[0.06em] text-on-surface-variant select-none">
            Categories & Customization
          </span>
          <Link
            href="/categories"
            className="flex items-center justify-between w-full bg-surface-container-low hover:bg-surface-container-high px-4 py-3 rounded-2xl text-on-surface font-body text-sm transition-colors active-press group"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70">
                category
              </span>
              <span className="font-semibold text-sm">Manage Categories</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50 group-hover:translate-x-0.5 transition-transform">
              chevron_right
            </span>
          </Link>
        </div>

        {/* Profile edit form */}
        <form action={formAction} className="flex flex-col gap-5">
          <FormField
            id="profile-name"
            label="Display Name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            disabled={isPending}
            placeholder="Your display name"
          />

          <button
            type="submit"
            disabled={isPending || !nameValue.trim()}
            className="mt-2 w-full rounded-full bg-primary py-4 font-headline font-bold text-on-primary transition-all hover:opacity-90 active-press disabled:opacity-40 text-[15px] tracking-[-0.01em] min-h-14 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div
        className="w-full rounded-3xl bg-surface-container-lowest border border-error/20 p-6 md:p-8 flex flex-col gap-4 soft-card-shadow mt-4"
      >
        <div className="flex flex-col gap-1 text-left">
          <h3 className="text-sm font-bold text-error uppercase tracking-wider">Danger Zone</h3>
          <p className="text-xs font-body text-on-surface-variant">
            Exit your session. Your data remains safe on this device.
          </p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-full border border-error/30 hover:bg-error/5 text-error py-3.5 font-headline font-bold transition-all active-press text-[14px] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
