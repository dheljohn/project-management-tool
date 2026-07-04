"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createInviteSchema,
  CreateInviteInput,
  CreateInviteOutput,
} from "../schemas/invite.schema";
import { useCreateInvite } from "../hooks/useInvites";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInviteInput, any, CreateInviteOutput>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: { maxUses: 10, expiresInDays: 7 },
  });

  const createInvite = useCreateInvite(projectId);

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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-fg mb-4">
          Invite people to this project
        </h2>

        {!generatedCode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-fg mb-1">
                Expires in (days)
              </label>
              <input
                type="number"
                {...register("expiresInDays", { valueAsNumber: true })}
                className="w-full rounded-md border border-input bg-bg px-3 py-2 text-sm text-fg"
              />
              {errors.expiresInDays && (
                <p className="text-xs text-destructive mt-1">
                  {errors.expiresInDays.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-muted-fg mb-1">
                Max uses
              </label>
              <input
                type="number"
                {...register("maxUses", { valueAsNumber: true })}
                className="w-full rounded-md border border-input bg-bg px-3 py-2 text-sm text-fg"
              />
              {errors.maxUses && (
                <p className="text-xs text-destructive mt-1">
                  {errors.maxUses.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-md text-muted-fg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createInvite.isPending}
                className="px-4 py-2 text-sm rounded-md bg-primary text-bg font-medium disabled:opacity-50"
              >
                {createInvite.isPending ? "Generating..." : "Generate code"}
              </button>
            </div>

            {createInvite.isError && (
              <p className="text-xs text-destructive">
                Something went wrong. Try again.
              </p>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-fg">
              Share this code with the people you want to invite:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-center text-lg tracking-widest font-mono bg-muted rounded-md py-3 text-fg">
                {generatedCode}
              </code>
              <button
                onClick={handleCopy}
                className="px-3 py-3 rounded-md bg-primary text-bg text-sm font-medium"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm rounded-md border border-border text-fg hover:bg-muted"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
