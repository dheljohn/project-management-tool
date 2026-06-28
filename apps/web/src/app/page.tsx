// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PublicRouteGuard from "../components/layout/PublicRouteGuard";

export default function BaseRouteGatekeeper() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      // User is authenticated -> Send them straight into the system workspace
      router.replace("/projects");
    } else {
      // User is a stranger -> Show them your beautiful marketing site
      router.replace("/landing");
    }
  }, [router]);

  // Render a minimal loader while evaluating client storage
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
