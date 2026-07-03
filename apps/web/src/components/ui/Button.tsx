import React from "react";

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
    "shrink-0 flex items-center gap-2 justify-center text-sm rounded-lg transition-opacity my-auto";

  const variantStyles = {
    xs: " flex items-center gap-1.5  hover:opacity-90 text-accent-foreground text-sm font-normal  rounded-lg transition-opacity",
    add: "shrink-0 flex items-center gap-1.5 bg-accent hover:opacity-90 text-accent-foreground text-sm font-medium px-4 py-2 rounded-lg transition-opacity",
    cancel:
      "px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors sm:px-2 sm:py-1 sm:text-xs",
    save: "px-4 py-2 text-sm bg-accent hover:opacity-90 disabled:opacity-50 text-accent-foreground rounded-lg transition-opacity font-medium ",
    // Corrected Pill Styles
    pill: "px-2 py-1 text-xs bg-accent hover:opacity-90 disabled:opacity-50 text-accent-foreground rounded-lg transition-opacity font-medium sm:px-4 sm:py-2 sm:text-xs",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {variant === "add" && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}

      {children}
    </button>
  );
};
