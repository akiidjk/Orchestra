import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "accent";
}

export function Button({
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    default: "bg-indigo-brand text-white hover:brightness-110",
    outline: "border border-border bg-card hover:brightness-95",
    accent: "bg-accent text-white hover:brightness-110",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
