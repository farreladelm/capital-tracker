"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

export function DesktopHeader() {
  const pathname = usePathname();

  // Exclude rendering on auth / onboarding flows
  const excludedPaths = ["/login", "/register", "/onboarding"];
  if (excludedPaths.includes(pathname)) {
    return null;
  }

  const handleTrendsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("trends");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", "/#trends");
      }
    }
  };

  return (
    <header className="hidden md:flex justify-between items-center px-margin-page h-16 w-full z-50 fixed top-0 bg-background/80 dark:bg-background/80 backdrop-blur-xl border-b border-surface-variant/50">
      {/* Brand logo & title */}
      <Link href="/" className="flex items-center gap-2 text-primary dark:text-primary-fixed hover:opacity-85 transition-opacity">
        <span className="material-symbols-outlined font-bold">account_balance_wallet</span>
        <span className="font-headline-md font-bold tracking-tight">Aura Finance</span>
      </Link>

      {/* Navigation Links */}
      <nav className="flex items-center gap-6">
        <Link 
          href="/" 
          className={`font-label-md transition-colors ${
            pathname === "/" ? "text-primary dark:text-primary-fixed font-semibold" : "text-secondary hover:text-on-background"
          }`}
        >
          Home
        </Link>
        <Link 
          href="/history" 
          className={`font-label-md transition-colors ${
            pathname === "/history" ? "text-primary dark:text-primary-fixed font-semibold" : "text-secondary hover:text-on-background"
          }`}
        >
          History
        </Link>
        <Link 
          href="/#trends" 
          onClick={handleTrendsClick}
          className="font-label-md transition-colors text-secondary hover:text-on-background"
        >
          Trends
        </Link>
        <Link 
          href="/account" 
          className={`font-label-md transition-colors ${
            pathname === "/account" ? "text-primary dark:text-primary-fixed font-semibold" : "text-secondary hover:text-on-background"
          }`}
        >
          Profile
        </Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button 
          onClick={async () => {
            await logout();
          }}
          className="text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors p-2 rounded-full flex items-center justify-center active-press cursor-pointer"
          aria-label="Logout"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}