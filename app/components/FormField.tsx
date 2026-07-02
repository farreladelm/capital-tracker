import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Field label text */
  label: ReactNode;
  /** Unique id — also used to wire the label's htmlFor */
  id: string;
  /** Optional helper text rendered below the input */
  hint?: string;
}

/**
 * Labelled input field following the Aura Finance design system:
 * rounded-2xl border, surface-container-lowest fill, primary focus ring.
 *
 * All native <input> props are forwarded, so type, name, required,
 * autoComplete, disabled, placeholder, minLength, etc. all work as normal.
 */
export default function FormField({ label, id, hint, className, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-label-sm uppercase tracking-[0.06em] text-on-surface-variant select-none"
      >
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "w-full rounded-2xl border-[1.5px] border-outline-variant",
          "bg-surface-container-lowest px-4 py-2",
          "font-body text-on-surface placeholder:text-outline text-sm",
          "focus:border-primary focus:outline-none focus:bg-surface",
          "transition-colors disabled:opacity-50",
          className,
        )}
        {...inputProps}
      />
      {hint && (
        <p className="pl-1 text-[11px] font-body text-outline">{hint}</p>
      )}
    </div>
  );
}
