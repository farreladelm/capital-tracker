import { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  prefix?: ReactNode;
  hint?: string;
};

export function Input({ label, prefix, hint, className, type = "text", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {prefix && (
          <span className="absolute left-4 text-sm font-semibold text-on-surface-variant/40 select-none flex items-center justify-center">
            {prefix}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "w-full rounded-2xl bg-surface py-3 px-4 text-sm font-body text-on-surface focus:outline-none border border-outline-variant/50 transition-all placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/10 disabled:opacity-50",
            prefix && "pl-10",
            className
          )}
          {...props}
        />
      </div>
      {hint && (
        <p className="pl-1 text-[11px] font-body text-outline">{hint}</p>
      )}
    </div>
  );
}
