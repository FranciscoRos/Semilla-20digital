import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Apoyos from "./pages/Apoyos";
import Cursos from "./pages/Cursos";
import Geomapa from "./pages/Geomapa";
import Asistente from "./pages/Asistente";
import Auditoria from "./pages/Auditoria";
import Registro from "./pages/Registro";
import ApoyoDetalle from "./pages/ApoyoDetalle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/apoyos" element={<Apoyos />} />
          <Route path="/apoyo/:id" element={<ApoyoDetalle />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/geomapa" element={<Geomapa />} />
          <Route path="/asistente" element={<Asistente />} />
          <Route path="/auditoria" element={<Auditoria />} />
          <Route path="/registro" element={<Registro />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
