"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AddTransactionModal } from "./AddTransactionModal";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 h-20 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-xl rounded-t-xl shadow-[0_-4px_20px_rgba(76,75,198,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      {/* Home (Active) */}
      <Link href="/" className={`flex flex-col items-center justify-center ${pathname === "/" ? "text-primary dark:text-primary-fixed" : "text-secondary dark:text-secondary-fixed-dim"} font-semibold hover:bg-primary/5 transition-colors active:scale-90 transition-transform duration-200 w-16 rounded-lg py-1`}>
        <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: `"FILL" ${pathname === "/" ? 1 : 0}` }}>home</span>
        <span className="font-label-sm">Home</span>
      </Link>
      
      {/* History */}
      <Link href="/history" className={`flex flex-col items-center justify-center ${pathname === "/history" ? "text-primary dark:text-primary-fixed" : "text-secondary dark:text-secondary-fixed-dim"} hover:bg-primary/5 transition-colors active:scale-90 transition-transform duration-200 w-16 rounded-lg py-1`}>
        <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: `"FILL" ${pathname === "/history" ? 1 : 0}` }}>receipt_long</span>
        <span className="font-label-sm">History</span>
      </Link>
      
      {/* Add (FAB Embedded) - Rendered directly */}
      <div className="flex flex-col items-center justify-center -mt-6">
        <AddTransactionModal />
      </div>

      {/* Trends */}
      <Link href="/trends" className={`flex flex-col items-center justify-center ${pathname === "/trends" ? "text-primary dark:text-primary-fixed" : "text-secondary dark:text-secondary-fixed-dim"} hover:bg-primary/5 transition-colors active:scale-90 transition-transform duration-200 w-16 rounded-lg py-1`}>
        <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: `"FILL" ${pathname === "/trends" ? 1 : 0}` }}>insights</span>
        <span className="font-label-sm">Trends</span>
      </Link>

      {/* Profile */}
      <Link href="/account" className={`flex flex-col items-center justify-center ${pathname === "/account" ? "text-primary dark:text-primary-fixed" : "text-secondary dark:text-secondary-fixed-dim"} hover:bg-primary/5 transition-colors active:scale-90 transition-transform duration-200 w-16 rounded-lg py-1`}>
        <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: `"FILL" ${pathname === "/account" ? 1 : 0}` }}>settings</span>
        <span className="font-label-sm">Profile</span>
      </Link>
    </nav>
  );
}
