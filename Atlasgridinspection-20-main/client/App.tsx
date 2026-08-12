import "./global.css";
import "./rea-redesign.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FieldOfficer from "./pages/FieldOfficer";
import Login from "./pages/Login";
import ConsultantAdmin from "./pages/ConsultantAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/view" element={<Index />} />
          <Route path="/field-officer" element={<FieldOfficer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/consultant-admin" element={<ConsultantAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root")!;
const rootStore = rootElement as HTMLElement & { __reaRoot?: ReturnType<typeof createRoot> };
const root = rootStore.__reaRoot ?? createRoot(rootElement);
rootStore.__reaRoot = root;
root.render(<App />);
