"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: RouteGuardProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useCurrentUser();

  useEffect(() => {
    if (isError && (error as any)?.response?.status === 401) {
      router.push("/login");
    }
  }, [isError, error, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  // 401 → redirecting (handled above); anything else (429, network error) → proceed optimistically
  if (isError && (error as any)?.response?.status === 401) {
    return null;
  }

  return <>{children}</>;
}
