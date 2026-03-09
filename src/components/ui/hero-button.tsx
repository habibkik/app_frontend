import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const heroButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-card text-foreground border border-border shadow-md hover:bg-secondary hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        accent:
          "bg-gradient-accent text-accent-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10",
        outline:
          "border-2 border-primary-foreground/30 text-primary-foreground hover:border-primary-foreground hover:bg-primary-foreground/10",
        // Column.com-inspired variants
        columnPrimary:
          "bg-column-teal text-white rounded-md shadow-md hover:brightness-110 active:scale-[0.98]",
        columnOutline:
          "border-2 border-white/30 text-white rounded-md hover:border-white hover:bg-white/10",
        columnDark:
          "bg-column-navy text-white rounded-md shadow-md hover:brightness-125 active:scale-[0.98]",
        columnNavOutline:
          "border border-column-card text-column-navy rounded-full text-sm font-medium hover:bg-white/60",
        columnNavFilled:
          "bg-column-navy text-white rounded-md text-sm font-semibold hover:brightness-125",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        xl: "h-16 px-10 py-5 text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface HeroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof heroButtonVariants> {
  asChild?: boolean;
}

const HeroButton = React.forwardRef<HTMLButtonElement, HeroButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(heroButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
HeroButton.displayName = "HeroButton";

export { HeroButton, heroButtonVariants };
