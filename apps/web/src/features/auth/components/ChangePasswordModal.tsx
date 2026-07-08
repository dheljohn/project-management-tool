"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  changePasswordSchema,
  ChangePasswordFormValues,
} from "../schemas/password.schema";
import { useChangePassword } from "../hooks/useChangePassword";

interface ChangePasswordModalProps {
  userId: string;
  onClose: () => void;
}

export default function ChangePasswordModal({
  userId,
  onClose,
}: ChangePasswordModalProps) {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const { mutate, isPending, error, reset } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Auto-close after success
  useEffect(() => {
    if (!succeeded) return;
    const t = setTimeout(onClose, 1500);
    return () => clearTimeout(t);
  }, [succeeded, onClose]);

  const onSubmit = (values: ChangePasswordFormValues) => {
    reset(); // clear previous error
    mutate(
      {
        user_id: userId,
        old_password: values.old_password,
        new_password: values.new_password,
      },
      { onSuccess: () => setSucceeded(true) },
    );
  };

  const inputClass =
    "w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-foreground text-sm " +
    "placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 " +
    "focus:ring-accent transition-colors disabled:opacity-50";

  const errorMessage = axios.isAxiosError(error)
    ? error.response?.status === 401
      ? "Current password is incorrect."
      : (error.response?.data?.message ?? "Something went wrong. Try again.")
    : error
      ? "Something went wrong. Try again."
      : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full sm:max-w-sm
          rounded-t-2xl sm:rounded-xl
          p-5 sm:p-6
          shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-muted" />
        </div>

        {succeeded ? (
          // ── Success state ───────────────────────────────────────────────────
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-done/10 text-status-done">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">
              Password updated successfully
            </p>
            <p className="text-xs text-muted-foreground">Closing…</p>
          </div>
        ) : (
          // ── Form ─────────────────────────────────────────────────────────────
          <>
            <h2 className="text-base font-semibold text-foreground mb-5">
              Change Password
            </h2>

            {errorMessage && (
              <div
                role="alert"
                className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive"
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Current password */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Current password
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isPending}
                    className={inputClass}
                    {...register("old_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showOld ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.old_password && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.old_password.message}
                  </p>
                )}
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    disabled={isPending}
                    className={inputClass}
                    {...register("new_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.new_password.message}
                  </p>
                )}
              </div>

              {/* Confirm new password */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    disabled={isPending}
                    className={inputClass}
                    {...register("confirm_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
