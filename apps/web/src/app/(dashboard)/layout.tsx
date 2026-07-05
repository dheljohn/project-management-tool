import Navbar from "../../components/layout/Navbar";
import ProtectedRoute from "../../components/layout/RouteGuard";
import { BreadcrumbProvider } from "../../context/BreadcrumbContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <BreadcrumbProvider>
        <div className="flex h-screen">
          <div className="flex flex-1 flex-col">
            <Navbar />
            <main className="flex-1 overflow-y-auto ">{children}</main>
          </div>
        </div>
      </BreadcrumbProvider>
    </ProtectedRoute>
  );
}
