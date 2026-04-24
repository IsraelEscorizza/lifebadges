import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border border-border text-foreground",
        success: "bg-green-100 text-green-700",
        warning: "bg-secondary text-neon-500",
        common:    "bg-gray-500/15 text-gray-400 dark:text-gray-400",
        uncommon:  "bg-green-500/15 text-green-600 dark:text-green-400",
        rare:      "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        epic:      "bg-purple-500/15 text-purple-600 dark:text-purple-400",
        legendary: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
