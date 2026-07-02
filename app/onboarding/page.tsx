import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { completeOnboarding } from "@/app/actions/onboarding";

export const metadata = {
  title: "Set Up Your Tracker — Capital Tracker",
  description: "Choose your default currency to start tracking.",
};

const CURRENCIES = [
  { code: "USD", symbol: "$",  name: "US Dollar"     },
  { code: "EUR", symbol: "€",  name: "Euro"           },
  { code: "GBP", symbol: "£",  name: "Pound"          },
  { code: "JPY", symbol: "¥",  name: "Yen"            },
  { code: "IDR", symbol: "Rp", name: "Rupiah"         },
  { code: "AUD", symbol: "A$", name: "Aus Dollar"     },
  { code: "CAD", symbol: "C$", name: "Can Dollar"     },
  { code: "INR", symbol: "₹",  name: "Rupee"          },
  { code: "SGD", symbol: "S$", name: "Sing Dollar"    },
];

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.currency) {
    redirect("/"); // Already onboarded
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient background orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(76,75,198,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-8">
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6 text-on-primary"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span className="font-headline-md text-on-surface font-semibold tracking-tight">
            Capital Tracker
          </span>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-3xl bg-surface-container-lowest px-8 py-10 sm:px-10"
          style={{ boxShadow: "0 4px 32px rgba(76,75,198,0.07), 0 1px 4px rgba(27,27,34,0.05)" }}
        >
          <div className="mb-8 text-center">
            <div className="mb-3 text-4xl" aria-hidden="true">🎉</div>
            <h1
              className="font-display text-on-surface text-[28px] leading-[34px] font-bold tracking-tight"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              One last step
            </h1>
            <p className="mt-2 font-body text-on-surface-variant text-[15px]">
              Pick your default currency. This can&apos;t be changed later.
            </p>
          </div>

          <form action={completeOnboarding} className="flex flex-col gap-6">
            {/* Currency grid */}
            <fieldset>
              <legend className="sr-only">Choose your currency</legend>
              <div className="grid grid-cols-3 gap-2.5">
                {CURRENCIES.map((c) => (
                  <label key={c.code} className="cursor-pointer group">
                    <input
                      type="radio"
                      name="currency"
                      value={c.code}
                      className="peer sr-only"
                      required
                    />
                    <div className="flex flex-col items-center gap-1 rounded-2xl border-[1.5px] border-outline-variant bg-surface p-4 text-center transition-all duration-150 peer-checked:border-primary peer-checked:bg-primary/[0.06] peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 group-hover:bg-surface-container group-hover:border-outline">
                      <span className="text-xl font-headline font-bold text-on-surface leading-none">
                        {c.symbol}
                      </span>
                      <span className="text-[10px] font-label-sm tracking-[0.05em] text-on-surface-variant uppercase mt-0.5">
                        {c.code}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Info note */}
            <div className="flex items-start gap-3 rounded-2xl bg-surface-container px-4 py-3.5">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 shrink-0 text-primary mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-body text-on-surface-variant leading-snug">
                Your base currency is permanent and used across all calculations and reports.
              </p>
            </div>

            <button
              id="onboarding-submit"
              type="submit"
              className="w-full rounded-full bg-primary py-4 font-headline font-bold text-on-primary transition-all hover:opacity-90 active-press text-[15px] tracking-[-0.01em] min-h-[56px]"
            >
              Start Tracking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
