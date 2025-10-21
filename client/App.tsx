import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Auth
import LoginProducer from "./pages/auth/LoginProducer";
import LoginAdmin from "./pages/auth/LoginAdmin";
import RegisterProducer from "./pages/auth/RegisterProducer";

// Producer Modules
import ProducerDashboard from "./pages/ProducerDashboard";
import CalendarioAgricola from "./pages/producer/CalendarioAgricola";
import Geomapa from "./pages/producer/Geomapa";
import SolicitarApoyos from "./pages/producer/SolicitarApoyos";

// Old pages (será reemplazadas gradualmente)
import Index from "./pages/Index";
import Apoyos from "./pages/Apoyos";
import Cursos from "./pages/Cursos";
import Asistente from "./pages/Asistente";
import Auditoria from "./pages/Auditoria";
import Registro from "./pages/Registro";
import ApoyoDetalle from "./pages/ApoyoDetalle";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import ValidatorDashboard from "./pages/ValidatorDashboard";

// Global
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ============ AUTENTICACIÓN ============ */}
          <Route path="/login-productor" element={<LoginProducer />} />
          <Route path="/login-admin" element={<LoginAdmin />} />
          <Route path="/registro-productor" element={<RegisterProducer />} />

          {/* ============ PRODUCTOR - DASHBOARDS ============ */}
          <Route path="/producer-dashboard" element={<ProducerDashboard />} />

          {/* ============ PRODUCTOR - MÓDULOS ============ */}
          <Route path="/calendario-agricola" element={<CalendarioAgricola />} />
          <Route path="/geomapa" element={<Geomapa />} />
          <Route path="/solicitar-apoyos" element={<SolicitarApoyos />} />

          {/* ============ ADMINISTRADOR ============ */}
          <Route path="/admin-panel" element={<AdminDashboard />} />
          <Route path="/validator-dashboard" element={<ValidatorDashboard />} />

          {/* ============ LEGACY ROUTES (será removidas) ============ */}
          <Route path="/" element={<Index />} />
          <Route path="/apoyos" element={<Apoyos />} />
          <Route path="/apoyo/:id" element={<ApoyoDetalle />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/asistente" element={<Asistente />} />
          <Route path="/auditoria" element={<Auditoria />} />
          <Route path="/registro" element={<Registro />} />

          {/* ============ 404 ============ */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global ChatBot - Disponible en todas las vistas */}
        <ChatBot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
