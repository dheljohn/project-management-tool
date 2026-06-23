// Wrapper
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check your auth state storage (Cookie, LocalStorage, Context, or Redux)
    const token = localStorage.getItem("auth_token");
    console.log(token);

    if (!token) {
      setIsAuthenticated(false);
      router.push("/login"); // Redirect to login if token is missing
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Show a loading state while checking credentials to prevent visual flash
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
