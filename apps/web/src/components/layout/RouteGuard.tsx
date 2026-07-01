"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "../../../lib/api";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: RouteGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .get("/testlogin/me")
      .then(() => {
        console.log("Authenticated");
        setIsAuthenticated(true);
      })
      .catch(() => {
        console.log("Not authenticated");
        (setIsAuthenticated(false), router.push("/login"));
      });
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
