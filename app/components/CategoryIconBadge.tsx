import { CategoryIcon } from "./CategoryIcon";
import { cn } from "@/lib/utils";

interface CategoryIconBadgeProps {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CategoryIconBadge({
  icon,
  color,
  size = "md",
  className,
}: CategoryIconBadgeProps) {
  const containerSizeClasses = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-12 h-12 rounded-2xl",
    lg: "w-16 h-16 rounded-[20px]",
  };

  const iconSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 aspect-square",
        containerSizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <CategoryIcon icon={icon} className={iconSizeClasses[size]} />
    </div>
  );
}
