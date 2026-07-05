import React from "react";
import { Plus } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;

  variant?: "add" | "cancel" | "save" | "xs" | "pill";
}

export const Button = ({
  children,
  variant = "add",
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "text-sm rounded-full border  px-4 py-2 transition-colors cursor-pointer";

  const variantStyles = {
    add: "bg-accent text-card hover:bg-card hover:text-accent",
    save: "bg-accent text-accent-foreground hover:bg-muted disabled:opacity-50",
    cancel: "bg-transparent text-muted-foreground hover:bg-muted border-none",
    pill: "   hover:text-foreground hover:bg-muted/60",
    xs: "bg-transparent text-accent-foreground hover:bg-muted",
  };
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {variant === "add" && <Plus className="mr-2 h-4 w-4" />}

      {children}
    </button>
  );
};
