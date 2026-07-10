import { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  prefix?: ReactNode;
};

export function Input({ label, prefix, className, type = "text", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {prefix && (
          <span className="absolute left-4 text-sm font-semibold text-on-surface-variant/40 select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "w-full rounded-2xl bg-surface py-3 px-4 text-sm font-body text-on-surface focus:outline-none border border-outline-variant/20 transition-all placeholder:text-on-surface-variant/40",
            prefix && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
