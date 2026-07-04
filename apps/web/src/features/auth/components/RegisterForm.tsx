"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "../schemas/register.schema";
import { useRegister } from "../hooks/useRegister";
import axios from "axios";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (values: RegisterFormValues) => mutate(values);

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  const inputClass =
    "block w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {axios.isAxiosError(error)
            ? (error.response?.data?.message ?? "Registration failed.")
            : "An unexpected error occurred."}
        </div>
      )}

      <div>
        <label
          htmlFor="user_id"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          User ID
        </label>
        <input
          id="user_id"
          autoComplete="username"
          disabled={isPending}
          placeholder="e.g. john_doe"
          className={inputClass}
          {...register("user_id")}
        />
        {errors.user_id && (
          <p className="text-xs text-destructive mt-1.5">
            {errors.user_id.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isPending}
          placeholder="you@example.com"
          className={inputClass}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive mt-1.5">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            autoComplete="new-password"
            type={showPassword ? "text" : "password"}
            disabled={isPending}
            placeholder="••••••••"
            className={inputClass}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive mt-1.5">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Confirm password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            autoComplete="new-password"
            type={showConfirmPassword ? "text" : "password"}
            disabled={isPending}
            placeholder="••••••••"
            className={`${inputClass} ${
              !passwordsMatch
                ? "border-destructive focus:border-destructive focus:ring-destructive"
                : ""
            }`}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive mt-1.5">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex w-full justify-center rounded-lg bg-accent px-4 py-2.5
                   text-sm font-semibold text-accent-foreground hover:opacity-90
                   disabled:opacity-50 transition-opacity"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
