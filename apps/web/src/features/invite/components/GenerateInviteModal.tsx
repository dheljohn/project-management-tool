"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createInviteSchema,
  CreateInviteInput,
  CreateInviteOutput,
} from "../schemas/invite.schema";
import { useCreateInvite } from "../hooks/useInvites";
import { Button } from "../../../components/ui/Button";

interface GenerateInviteModalProps {
  projectId: number;
  onClose: () => void;
}

export function GenerateInviteModal({
  projectId,
  onClose,
}: GenerateInviteModalProps) {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInviteInput, any, CreateInviteOutput>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: { maxUses: 10, expiresInDays: 7 },
  });

  const createInvite = useCreateInvite(projectId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const onSubmit = (data: CreateInviteOutput) => {
    createInvite.mutate(data, {
      onSuccess: (invite) => setGeneratedCode(invite.code),
    });
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    "bg-muted border border-border rounded-md px-3.5 py-2.5 sm:px-4 sm:py-2 w-full text-foreground text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors";

  return (
    <div
      onClick={handleBackdropClick}
      /* items-end pushes the modal container to the screen bottom on mobile, sm:items-center centers it on desktop */
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-[2px]"
    >
      {/* Modal Box */}
      <div
        ref={modalRef}
        /* Mobile: rounded bottom-none, max-w-full, slides up. Desktop: rounded-xl, max-w-sm, scales in. */
        className="relative bg-card border-t sm:border border-border rounded-t-2xl sm:rounded-xl p-6 w-full max-w-full sm:max-w-sm shadow-lg animate-in slide-in-from-bottom sm:slide-in-from-none sm:zoom-in-95 duration-200"
      >
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-5 sm:hidden" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring sm:block hidden"
          aria-label="Close modal"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://w3.org"
            className="text-muted-foreground"
          >
            <path
              d="M11.7816 4.03157C11.9768 3.83631 11.9768 3.51973 11.7816 3.32447C11.5863 3.12921 11.2697 3.12921 11.0745 3.32447L7.5 6.89894L3.92553 3.32447C3.73027 3.12921 3.41369 3.12921 3.21843 3.32447C3.02317 3.51973 3.02317 3.83631 3.21843 4.03157L6.79289 7.60603L3.21843 11.1805C3.02317 11.3758 3.02317 11.6923 3.21843 11.8876C3.41369 12.0829 3.73027 12.0829 3.92553 11.8876L7.5 8.31312L11.0745 11.8876C11.2697 12.0829 11.5863 12.0829 11.7816 11.8876C11.9768 11.6923 11.9768 11.3758 11.7816 11.1805L8.20711 7.60603L11.7816 4.03157Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-foreground mb-4 pr-6">
          Invite people to this project
        </h2>

        {!generatedCode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground text-xs font-medium block mb-1">
                Expires in (days)
              </label>
              <input
                type="number"
                {...register("expiresInDays", { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.expiresInDays && (
                <p className="text-xs text-destructive mt-1">
                  {errors.expiresInDays.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-muted-foreground text-xs font-medium block mb-1">
                Max uses
              </label>
              <input
                type="number"
                {...register("maxUses", { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.maxUses && (
                <p className="text-xs text-destructive mt-1">
                  {errors.maxUses.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 pb-4 sm:pb-0">
              <Button
                variant="cancel"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-md flex-1 sm:flex-none"
              >
                Cancel
              </Button>

              <Button
                variant="save"
                type="submit"
                disabled={createInvite.isPending}
                className="flex-1 sm:flex-none"
              >
                {createInvite.isPending ? "Generating..." : "Generate code"}
              </Button>
            </div>

            {createInvite.isError && (
              <p className="text-xs text-destructive text-center mt-2">
                Something went wrong. Try again.
              </p>
            )}
          </form>
        ) : (
          <div className="space-y-4 pb-4 sm:pb-0">
            <p className="text-sm text-muted-foreground">
              Share this code with the people you want to invite:
            </p>

            <div className="flex items-center w-full rounded-full border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
              <code className="w-3/4 px-4 py-2 text-center text-base tracking-widest font-mono text-foreground bg-transparent select-all">
                {generatedCode}
              </code>
              <button
                onClick={handleCopy}
                className="w-1/4 h-full py-3 text-sm rounded-none bg-accent text-accent-foreground font-medium transition-opacity hover:opacity-90 shrink-0 border-l border-input"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-muted font-medium transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
