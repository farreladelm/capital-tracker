import Link from "next/link";
import { signIn } from "@/auth";
import LoginForm from "@/app/components/LoginForm";

export const metadata = {
  title: "Sign In — Capital Tracker",
  description: "Log in to track your capital and expenses effortlessly.",
};

export default function LoginPage() {
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
            <h1
              className="font-display text-on-surface text-[28px] leading-[34px] font-bold tracking-tight"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              Welcome back
            </h1>
            <p className="mt-2 font-body text-on-surface-variant text-[15px]">
              Sign in to continue tracking
            </p>
          </div>

          <LoginForm />

          <div className="my-7 flex items-center gap-3 text-outline">
            <div className="flex-1 border-t border-outline-variant" />
            <span className="text-[11px] font-label-sm uppercase tracking-[0.06em]">or</span>
            <div className="flex-1 border-t border-outline-variant" />
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              id="login-google"
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-full border border-outline-variant bg-surface-container-lowest py-4 font-headline text-[14px] font-semibold text-on-surface transition-colors hover:bg-surface-container active-press min-h-[56px]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-body text-on-surface-variant">
            No account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline underline-offset-2"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
