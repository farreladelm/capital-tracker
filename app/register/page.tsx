import Link from "next/link";
import { signIn } from "@/auth";
import RegisterForm from "@/app/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative z-0">
      <div className="w-full max-w-lg rounded bg-surface-container-low border-[1.5px] border-outline-variant p-8 sm:p-12 shadow-sm relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-[32px] font-headline font-bold text-on-surface tracking-tight">Create Account</h1>
          <p className="text-on-surface-variant font-body mt-2">Start tracking your capital today</p>
        </div>
        
        <RegisterForm />

        <div className="my-6 flex items-center text-on-surface-variant">
          <div className="flex-1 border-t-[1.5px] border-outline-variant"></div>
          <span className="px-4 text-xs font-label uppercase tracking-wider font-bold">or</span>
          <div className="flex-1 border-t-[1.5px] border-outline-variant"></div>
        </div>

        <form action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}>
          <button type="submit" className="w-full rounded border-[1.5px] border-outline-variant bg-surface py-3 font-headline font-semibold text-on-surface transition-colors hover:bg-surface-container-high active-press flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-body text-on-surface-variant">
          Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline hover:text-primary-container">Sign in</Link>
        </p>
      </div>

    </div>
  );
}
