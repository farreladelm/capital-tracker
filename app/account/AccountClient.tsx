"use client";

import { useActionState, useState, useEffect } from "react";
import FormField from "@/app/components/FormField";
import { updateProfile } from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import Link from "next/link";
import { toast } from "sonner";

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

  // Sync state changes with toast notifications
  useEffect(() => {
    if (state?.success) {
      toast.success("Changes saved successfully!");
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-6 w-full pb-12">

      {/* Header section */}
      <section className="text-left flex flex-col gap-1">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface">Profile</h1>
        <p className="font-body-md text-on-surface-variant">Manage your identity and settings</p>
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

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Bento Row 1: Identity & Info Card (Full Width - Spans both columns) */}
        <div className="w-full md:col-span-2 rounded-3xl bg-surface-container-lowest border border-surface-variant/50 p-6 md:p-8 flex flex-col gap-6 soft-card-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: Identity Form */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  badge
                </span>
                <span className="font-headline-md text-sm text-on-surface">Profile Identity</span>
              </div>
              
              <form action={formAction} className="flex flex-col gap-4">
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
                  disabled={isPending || !nameValue.trim() || nameValue === user.name}
                  className="w-full rounded-full bg-primary py-3.5 font-headline font-bold text-on-primary transition-all hover:opacity-90 active-press disabled:opacity-40 text-[14px] tracking-[-0.01em] flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Account Info */}
            <div className="flex flex-col gap-5 border-t md:border-t-0 md:border-l border-surface-variant/30 pt-6 md:pt-0 md:pl-8 h-full justify-between">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    info
                  </span>
                  <span className="font-headline-md text-sm text-on-surface">Account Info</span>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Email details (non-editable) */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-label-sm uppercase tracking-[0.06em] text-on-surface-variant select-none">
                      Registered Email
                    </span>
                    <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-xl border border-surface-variant/20">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">
                        mail
                      </span>
                      <span className="font-body text-on-surface text-xs truncate">{user.email}</span>
                    </div>
                  </div>

                  {/* Base Currency (non-editable) */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-label-sm uppercase tracking-[0.06em] text-on-surface-variant select-none">
                      Base Currency
                    </span>
                    <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-xl border border-surface-variant/20">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">
                        payments
                      </span>
                      <span className="font-body text-on-surface text-xs font-semibold">{user.currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[10px] font-body text-outline leading-tight mt-6">
                Email and base currency are configured permanently at signup and cannot be updated.
              </p>
            </div>

          </div>
        </div>

        {/* Bento Row 2: Categories Customization Card (Left Side) */}
        <div className="w-full rounded-3xl bg-surface-container-lowest border border-surface-variant/50 p-6 md:p-8 flex flex-col justify-between soft-card-shadow min-h-[140px]">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">
                palette
              </span>
              <span className="font-headline-md text-sm text-on-surface">Categories & Customization</span>
            </div>

            <Link
              href="/categories"
              className="flex items-center justify-between w-full bg-primary/5 hover:bg-primary/10 px-4 py-3.5 rounded-2xl text-primary font-semibold text-sm transition-colors active-press group border border-primary/10"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  category
                </span>
                <span>Manage Categories</span>
              </div>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                chevron_right
              </span>
            </Link>
          </div>
        </div>

        {/* Bento Row 2: Danger Zone / Log Out (Right Side) */}
        <div className="w-full rounded-3xl bg-surface-container-lowest border border-error/20 p-6 md:p-8 flex flex-col justify-between soft-card-shadow min-h-[140px]">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[20px]">
                warning
              </span>
              <span className="font-headline-md text-sm">Danger Zone</span>
            </div>

            <form action={logout} className="w-full">
              <button
                type="submit"
                className="w-full rounded-full border border-error/30 hover:bg-error/5 text-error py-3.5 font-headline font-bold transition-all active-press text-[13px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign Out
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
