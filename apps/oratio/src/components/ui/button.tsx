import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Buttons of direction D. "primary" is the one orange action per screen,
 * with a key-like bottom edge; it sinks a little when pressed. Everything
 * else is secondary (outlined) or ghost. Heights are thumb-sized.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] font-bold transition-[transform,box-shadow,background-color,color] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px] shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-voice text-on-voice uppercase tracking-[0.01em] font-extrabold shadow-[0_4px_0_var(--color-voice-edge)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-voice-edge)]",
        good: "bg-good text-white font-extrabold shadow-[0_4px_0_var(--color-good-edge)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-good-edge)]",
        secondary: "bg-surface text-ink border-2 border-line-strong hover:bg-surface-2",
        ghost: "text-muted hover:text-ink hover:bg-surface-2",
        danger: "bg-danger-soft text-danger font-extrabold hover:opacity-90",
        link: "text-voice underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-12 px-4 text-[15px]",
        lg: "h-14 px-6 text-base",
        icon: "size-12",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, block, className }))} {...props} />;
}

export { Button, buttonVariants };
