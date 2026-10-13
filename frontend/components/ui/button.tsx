import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default:
        "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-medium shadow-sm transition-all active:scale-[0.98]",
      destructive:
        "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/25",
      outline:
        "border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 dark:border-white/10 dark:bg-zinc-900/60 dark:hover:bg-white/[0.06] dark:text-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
      secondary:
        "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-zinc-200/50 dark:border-white/5",
      ghost:
        "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:text-zinc-400 dark:hover:text-zinc-100",
      link:
        "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizeClasses = {
      default: "h-9 px-3.5 py-1.5 text-xs sm:text-sm rounded-lg",
      sm: "h-7 rounded-md px-2.5 text-xs",
      lg: "h-11 rounded-lg px-5 text-sm",
      icon: "h-8 w-8 p-0 rounded-lg justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-40",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
