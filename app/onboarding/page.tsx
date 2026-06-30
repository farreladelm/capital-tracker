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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome! 🎉</h1>
          <p className="text-slate-500 mt-2">Let's set up your tracker. Pick your default currency.</p>
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
              <label key={c.code} className="cursor-pointer">
                <input type="radio" name="currency" value={c.code} className="peer sr-only" required />
                <div className="rounded-xl border-2 border-slate-100 p-4 text-center transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-slate-50">
                  <div className="text-2xl font-bold text-slate-800">{c.symbol}</div>
                  <div className="text-sm font-medium text-slate-500">{c.code}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            <strong>Note:</strong> This becomes your permanent base currency and cannot be changed later.
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
          >
            Start Tracking
          </button>
        </form>
      </div>
    </div>
  );
}
