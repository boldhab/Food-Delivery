import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-700 active:bg-primary-800",
        destructive:
          "bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:bg-rose-800",
        outline:
          "border border-border bg-card text-foreground shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground hover:border-border/80",
        secondary:
          "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-200 dark:hover:bg-slate-700",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 rounded-xl px-3.5 py-2 [&_svg]:size-4",
        sm: "h-8 rounded-lg px-2.5 text-xs [&_svg]:size-3.5",
        lg: "h-10 rounded-xl px-5 text-sm [&_svg]:size-4.5",
        icon: "h-9 w-9 rounded-xl p-0 [&_svg]:size-4",
        "icon-sm": "h-8 w-8 rounded-lg p-0 [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
