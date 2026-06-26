import PublicRouteGuard from "../../components/layout/PublicRouteGuard";
import ProtectedRoute from "../../components/layout/RouteGuard";

// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicRouteGuard>
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-slate-200">
          {/* Renders your login or registration page inside the card */}
          {children}
        </div>
      </div>
    </PublicRouteGuard>
  );
}
