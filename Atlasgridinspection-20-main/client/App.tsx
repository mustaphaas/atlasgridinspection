import "./global.css";
import "./rea-redesign.css";
import "./modernized.css";
import "./admin-unified.css";
import "./rea-functional.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AtlasGridProvider, portalDestination, useAtlasGrid, type PortalRole } from "@/context/AtlasGridContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ConsultantAdmin from "./pages/ConsultantAdmin";
import FieldOfficer from "./pages/FieldOfficer";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RoleRoute({ roles, children }: { roles: PortalRole[]; children: ReactNode }) {
  const { currentUser } = useAtlasGrid();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!roles.includes(currentUser.role)) return <Navigate to={portalDestination(currentUser.role)} replace />;
  return children;
}

function PortalRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleRoute roles={["REA Admin", "REA Reviewer", "Auditor"]}><Index /></RoleRoute>} />
      <Route path="/view" element={<RoleRoute roles={["REA Admin", "REA Reviewer", "Auditor"]}><Index /></RoleRoute>} />
      <Route path="/field-officer" element={<RoleRoute roles={["Field Officer"]}><FieldOfficer /></RoleRoute>} />
      <Route path="/consultant-admin" element={<RoleRoute roles={["Consultant Admin"]}><ConsultantAdmin /></RoleRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AtlasGridProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PortalRoutes />
        </BrowserRouter>
      </AtlasGridProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root")!;
const rootStore = rootElement as HTMLElement & { __reaRoot?: ReturnType<typeof createRoot> };
const root = rootStore.__reaRoot ?? createRoot(rootElement);
rootStore.__reaRoot = root;
root.render(<App />);
