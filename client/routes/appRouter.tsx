import { Route, Routes } from "react-router-dom";
import NotFound from "../pages/NotFound";
// Auth
import LoginProducer from "../pages/auth/LoginProducer";
import LoginAdmin from "../pages/auth/LoginAdmin";
import RegisterProducer from "../pages/auth/RegisterProducer";

// Producer Dashboard
import ProducerDashboard from "../pages/ProducerDashboard";

// Producer Modules
import CalendarioAgricola from "../pages/producer/CalendarioAgricola";
import Geomapa from "../pages/producer/Geomapa";
import SolicitarApoyos from "../pages/producer/SolicitarApoyos";
import CursosCapacitacion from "../pages/producer/CursosCapacitacion";
import ForosDiscusion from "../pages/producer/ForosDiscusion";
import PanelTransparencia from "../pages/producer/PanelTransparencia";

// Admin Dashboard
import AdminDashboard from "../pages/AdminDashboard";

// Admin Modules
import ValidacionProductores from "../pages/admin/ValidacionProductores";
import ValidacionSolicitudes from "../pages/admin/ValidacionSolicitudes";
import GestionCursos from "../pages/admin/GestionCursos";
import GestionApoyos from "../pages/admin/GestionApoyos";
import ModeracionForos from "../pages/admin/ModeracionForos";
import ValidacionGeomapa from "../pages/admin/ValidacionGeomapa";


// Old pages (será reemplazadas gradualmente)
import Index from "../pages/Index";
import Apoyos from "../pages/Apoyos";
import Cursos from "../pages/Cursos";
import Asistente from "../pages/Asistente";
import Auditoria from "../pages/Auditoria";
import Registro from "../pages/Registro";
import ApoyoDetalle from "../pages/ApoyoDetalle";
import ValidatorDashboard from "../pages/ValidatorDashboard";
import LayoutGeneral from "@/layouts/generalLayout";
import GestionPadron from "@/pages/admin/GestionPadron";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ============ AUTENTICACIÓN ============ */}
      <Route path="/login-productor" element={<LoginProducer />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/registro-productor" element={<RegisterProducer />} />

      {/* ============ PRODUCTOR - DASHBOARD ============ */}
      <Route element={<LayoutGeneral />}>
        <Route path="producer-dashboard" element={<ProducerDashboard />} />

        {/* ============ PRODUCTOR - M��DULOS ============ */}
        <Route path="calendario-agricola" element={<CalendarioAgricola />} />
        <Route path="geomapa" element={<Geomapa />} />
        <Route path="solicitar-apoyos" element={<SolicitarApoyos />} />
        <Route path="cursos-capacitacion" element={<CursosCapacitacion />} />
        <Route path="foros-discusion" element={<ForosDiscusion />} />
        <Route path="panel-transparencia" element={<PanelTransparencia />} />

        {/* ============ ADMINISTRADOR - DASHBOARD ============ */}
        <Route path="admin-panel" element={<AdminDashboard />} />

        {/* ============ ADMINISTRADOR - MÓDULOS ============ */}
        <Route
          path="admin/validacion-productores"
          element={<ValidacionProductores />}
        />
        <Route
          path="admin/validacion-solicitudes"
          element={<ValidacionSolicitudes />}
        />
        <Route path="admin/gestion-cursos" element={<GestionCursos />} />
        <Route path="admin/gestion-apoyos" element={<GestionApoyos />} />
        <Route path="admin/moderacion-foros" element={<ModeracionForos />} />
        <Route path="admin/gestion-padron" element={<GestionPadron />} />
        <Route path="admin/validacion-geomapa" element={<ValidacionGeomapa />} />


        {/* ============ LEGACY ROUTES (será removidas) ============ */}
        <Route index element={<Index />} />
        <Route path="apoyos" element={<Apoyos />} />
        <Route path="apoyo/:id" element={<ApoyoDetalle />} />
        <Route path="cursos" element={<Cursos />} />
        <Route path="asistente" element={<Asistente />} />
        <Route path="auditoria" element={<Auditoria />} />
        <Route path="registro" element={<Registro />} />
        <Route path="validator-dashboard" element={<ValidatorDashboard />} />
      </Route>

      {/* ============ 404 ============ */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
