"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PublicRouteGuardProps {
  children: React.ReactNode;
}

export default function PublicRouteGuard({ children }: PublicRouteGuardProps) {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      setIsGuest(false);
      router.push("/dashboard"); // Redirect logged-in users away from login page
    } else {
      setIsGuest(true);
    }
  }, [router]);

  if (isGuest === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return isGuest ? <>{children}</> : null;
}
