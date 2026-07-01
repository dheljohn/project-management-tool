"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { loginSchema, LoginFormValues } from "../schemas/login.schema";
import { useLogin } from "../hooks/useLogin";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginFormValues) => mutate(values);

  const inputClass =
    "block w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-sm transition-colors";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {(error as any)?.response?.data?.message ??
            "Network error. Cannot reach the authentication server."}
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
          placeholder="e.g. john_doe"
          className={inputClass}
          {...register("user_id")}
        />
        {errors.user_id && (
          <p className="mt-1 text-xs text-destructive">
            {errors.user_id.message}
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
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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
          <p className="mt-1 text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex w-full justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
