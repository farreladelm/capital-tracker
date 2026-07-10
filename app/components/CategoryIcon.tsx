import { cn } from "@/lib/utils";

interface CategoryIconProps {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}

export function isEmoji(str: string): boolean {
  // Emojis are generally non-alphanumeric or outside the ASCII range.
  // Standard material icons are alphanumeric with underscores, e.g. "shopping_cart".
  return !/^[a-z_0-9\-]+$/i.test(str);
}

export function CategoryIcon({ icon, className, style }: CategoryIconProps) {
  if (isEmoji(icon)) {
    return (
      <span className={cn("select-none text-2xl flex items-center justify-center", className)} style={style}>
        {icon}
      </span>
    );
  }

  return (
    <span className={cn("material-symbols-outlined select-none flex items-center justify-center", className)} style={style}>
      {icon}
    </span>
  );
}
