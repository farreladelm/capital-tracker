"use client";

import { useActionState, useState, useEffect } from "react";
import { Input } from "@/app/components/Input";
import { updateProfile } from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type UserProfile = {
  name: string;
  email: string;
  currency: string;
  gender: string | null;
  birthDate: string | null;
  financialGoal: string | null;
  targetSavingsRate: number | null;
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
  const [genderValue, setGenderValue] = useState<string>(user.gender || "");
  const [birthDateValue, setBirthDateValue] = useState<string>(user.birthDate || "");
  const [financialGoalValue, setFinancialGoalValue] = useState<string>(user.financialGoal || "");
  const [targetSavingsRateValue, setTargetSavingsRateValue] = useState<number>(user.targetSavingsRate || 0);

  // Sync state changes with toast notifications
  useEffect(() => {
    if (state?.success) {
      toast.success("Changes saved successfully!");
    }
  }, [state]);

  const isModified =
    nameValue !== user.name ||
    genderValue !== (user.gender || "") ||
    birthDateValue !== (user.birthDate || "") ||
    financialGoalValue !== (user.financialGoal || "") ||
    targetSavingsRateValue !== (user.targetSavingsRate || 0);

  const isSubmitDisabled = isPending || !nameValue.trim() || !isModified;

  const genders = [
    { id: "MALE", label: "Male", icon: "👨" },
    { id: "FEMALE", label: "Female", icon: "👩" },
    { id: "OTHER", label: "Other", icon: "🧑" },
    { id: "PREFER_NOT_TO_SAY", label: "Prefer not to say", icon: "🤐" },
  ];

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
              
              <form action={formAction} className="flex flex-col gap-5">
                <Input
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

                {/* Gender pills */}
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-[11px] font-label-md uppercase tracking-[0.06em] text-on-surface-variant select-none">
                    Gender
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {genders.map((g) => {
                      const isActive = genderValue === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGenderValue(g.id)}
                          disabled={isPending}
                          className={cn(
                            "h-8 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 active-press cursor-pointer border select-none",
                            isActive
                              ? "bg-primary text-on-primary border-primary shadow-sm"
                              : "bg-surface-container hover:bg-surface-container-high border-surface-variant/20 text-secondary"
                          )}
                        >
                          <span className="text-sm leading-none">{g.icon}</span>
                          <span>{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <input type="hidden" name="gender" value={genderValue} />
                </div>

                {/* Birth Date */}
                <Input
                  id="birthDate"
                  label="Birth Date"
                  type="date"
                  name="birthDate"
                  value={birthDateValue}
                  onChange={(e) => setBirthDateValue(e.target.value)}
                  disabled={isPending}
                  prefix={
                    <span className="material-symbols-outlined text-[18px]">
                      calendar_today
                    </span>
                  }
                />

                {/* Financial Goal */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="financialGoal" className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] select-none">
                    Primary Financial Goal
                  </label>
                  <div className="relative flex items-center w-full">
                    <span className="absolute left-4 text-sm font-semibold text-on-surface-variant/40 select-none flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">
                        target
                      </span>
                    </span>
                    <select
                      id="financialGoal"
                      name="financialGoal"
                      value={financialGoalValue}
                      onChange={(e) => setFinancialGoalValue(e.target.value)}
                      disabled={isPending}
                      className="w-full rounded-2xl bg-surface py-3 pl-10 pr-10 text-sm font-body text-on-surface focus:outline-none border border-outline-variant/20 transition-all cursor-pointer appearance-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10"
                    >
                      <option value="">Select a goal</option>
                      <option value="TRACKING">📊 Simple Expense Tracking</option>
                      <option value="DEBT_PAYOFF">💳 Debt Payoff Focus</option>
                      <option value="EMERGENCY_FUND">🛡️ Build Emergency Fund</option>
                      <option value="BIG_PURCHASE">🏠 Save for Big Purchase</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 text-[18px] text-on-surface-variant/50 pointer-events-none">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Target Savings Rate */}
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <label htmlFor="targetSavingsRate" className="text-[11px] font-label-md uppercase tracking-[0.06em] text-on-surface-variant select-none">
                      Target Savings Rate
                    </label>
                    <span className="text-xs font-headline font-bold text-primary">{targetSavingsRateValue}%</span>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-container-low border border-surface-variant/20 rounded-xl px-4 py-3">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70">
                      savings
                    </span>
                    <input
                      type="range"
                      id="targetSavingsRate"
                      name="targetSavingsRate"
                      min="0"
                      max="100"
                      step="1"
                      value={targetSavingsRateValue}
                      onChange={(e) => setTargetSavingsRateValue(parseInt(e.target.value, 10))}
                      disabled={isPending}
                      className="w-full accent-primary h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitDisabled}
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
                  <Input
                    label="Registered Email"
                    value={user.email}
                    readOnly
                    disabled
                    prefix={
                      <span className="material-symbols-outlined text-[18px]">
                        mail
                      </span>
                    }
                  />

                  {/* Base Currency (non-editable) */}
                  <Input
                    label="Base Currency"
                    value={user.currency}
                    readOnly
                    disabled
                    prefix={
                      <span className="material-symbols-outlined text-[18px]">
                        payments
                      </span>
                    }
                    className="font-semibold"
                  />
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
