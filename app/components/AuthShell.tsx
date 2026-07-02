import type { ReactNode } from "react";

interface AuthShellProps {
  /** Page heading, e.g. "Welcome back" */
  heading: string;
  /** Supporting subtext below the heading */
  subtext: string;
  /** Optional decorative element rendered above the heading (e.g. an emoji) */
  decorator?: ReactNode;
  children: ReactNode;
}

/**
 * Shared layout shell for all auth and onboarding screens.
 * Renders the ambient iris orb, brand wordmark, and the white card container.
 */
export default function AuthShell({ heading, subtext, decorator, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient iris orb — tonal depth without a loud gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(76,75,198,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-8">
        {/* Brand wordmark */}
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
          style={{
            boxShadow:
              "0 4px 32px rgba(76,75,198,0.07), 0 1px 4px rgba(27,27,34,0.05)",
          }}
        >
          <div className="mb-8 text-center">
            {decorator && (
              <div className="mb-3 text-4xl" aria-hidden="true">
                {decorator}
              </div>
            )}
            <h1
              className="font-display text-on-surface text-[28px] leading-[34px] font-bold tracking-tight"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              {heading}
            </h1>
            <p className="mt-2 font-body text-on-surface-variant text-[15px]">
              {subtext}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
