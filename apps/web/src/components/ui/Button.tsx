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
    add: "bg-accent text-card ",
    save: "flex items-center gap-1.5 bg-accent text-accent-foreground text-sm font-medium px-4 py-2 rounded-full cursor-pointer transform transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 justify-center w-full ",
    cancel:
      "bg-transparent text-muted-foreground hover:text-foreground border-none",
    pill: "   hover:text-foreground hover:bg-muted/60",
    xs: " text-accent-foreground border-none",
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
