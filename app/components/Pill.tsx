import { cn } from "@/lib/utils";

type PillProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  children: React.ReactNode;
};

export function Pill({ active, children, className, ...props }: PillProps) {
  return (
    <button
      className={cn(
        "h-7 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active-press flex items-center justify-center cursor-pointer select-none max-w-[100px] truncate",
        active
          ? "bg-primary text-on-primary shadow-sm scale-100"
          : "bg-surface-container hover:bg-surface-container-high text-secondary",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
