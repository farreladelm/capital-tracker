import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { completeOnboarding } from "@/app/actions/onboarding";

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
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative z-0">
      <div className="w-full max-w-lg rounded bg-surface-container-low border-[1.5px] border-outline-variant p-8 sm:p-12 shadow-sm relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-[32px] font-headline font-bold text-on-surface tracking-tight">Welcome! 🎉</h1>
          <p className="text-on-surface-variant font-body mt-2">Let&apos;s set up your tracker. Pick your default currency.</p>
        </div>
        
        <form action={completeOnboarding} className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { code: "USD", symbol: "$" },
              { code: "EUR", symbol: "€" },
              { code: "GBP", symbol: "£" },
              { code: "JPY", symbol: "¥" },
              { code: "IDR", symbol: "Rp" },
              { code: "AUD", symbol: "A$" },
              { code: "CAD", symbol: "C$" },
              { code: "INR", symbol: "₹" },
              { code: "SGD", symbol: "S$" },
            ].map((c) => (
              <label key={c.code} className="cursor-pointer group">
                <input type="radio" name="currency" value={c.code} className="peer sr-only" required />
                <div className="rounded border-[1.5px] border-outline-variant p-4 text-center transition-colors peer-checked:border-primary peer-checked:bg-surface-container-high group-hover:bg-surface-container-high bg-surface">
                  <div className="text-2xl font-headline font-bold text-on-surface">{c.symbol}</div>
                  <div className="text-xs font-label tracking-wider text-on-surface-variant mt-1">{c.code}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="rounded bg-surface-container-high p-4 text-sm font-body text-on-surface-variant border-[1.5px] border-outline-variant">
            <strong className="text-on-surface">Note:</strong> This becomes your permanent base currency and cannot be changed later.
          </div>

          <button
            type="submit"
            className="w-full rounded bg-primary py-4 font-headline font-bold text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container active-press"
          >
            Start Tracking
          </button>
        </form>
      </div>

    </div>
  );
}
