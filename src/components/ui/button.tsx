import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        /*
         * Cold Steel. The variants above are stock shadcn and stay for the routes
         * that have not been rewritten yet; the two below are the theme's own, and
         * are the only ones a rewritten view should reach for.
         *
         * `ember` is THE action — one per screen. If two things on a screen are
         * ember, one of them is wrong. Everything else that is still a button is
         * `quiet`. Radius and shadow are unset here rather than in the base so the
         * stock variants keep behaving like stock shadcn.
         */
        ember:
          "bg-ember text-ember-ink hover:bg-ember-hover rounded-none shadow-none",
        quiet:
          "border border-line-600 bg-transparent text-ink-500 hover:text-ink-100 hover:bg-steel-700 hover:border-line-500 rounded-none shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",

        /*
         * The dense header/toolbar button: the `micro-label` type ramp, sized by
         * padding rather than a fixed height so it lines up with the plain
         * <button>s next to it. The icon rule repeats the base selector verbatim
         * so tailwind-merge collapses the two into one.
         */
        micro:
          "h-auto gap-1.5 px-2.5 py-1.5 font-mono text-[9px] tracking-micro uppercase leading-none [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
