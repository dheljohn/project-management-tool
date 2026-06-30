import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  // 1. Tell the button it can accept a variant style
  variant?: "add" | "cancel" | "save";
}

export const Button = ({
  children,
  variant = "add",
  className = "",
  ...props
}: ButtonProps) => {
  // 2. Define the different Tailwind styles for each look
  const baseStyles =
    "shrink-0 flex items-center gap-2 text-sm  px-4 py-2.5 rounded-lg transition-opacity my-auto";
  // "shrink-0 flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-opacity my-auto";

  const variantStyles = {
    add: "shrink-0 flex items-center gap-1.5 bg-accent hover:opacity-90 text-accent-foreground text-sm font-medium px-4 py-2 rounded-lg transition-opacity",
    cancel:
      "px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
    save: "px-4 py-2 text-sm bg-accent hover:opacity-90 disabled:opacity-50 text-accent-foreground rounded-lg transition-opacity font-medium",
  };

  return (
    <button
      // 3. Combine the styles automatically based on the variant
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
