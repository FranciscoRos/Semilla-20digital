// AppRoutes.tsx
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/routes/routerGuard";

import LayoutGeneral from "@/layouts/generalLayout";

// Auth
import LoginProducer from "../pages/auth/LoginProducer";
import LoginAdmin from "../pages/auth/LoginAdmin";
import RegisterProducer from "../pages/auth/RegisterProducer";
import InitialDatosUsuario from "@/pages/producer/ProducerRegistro";
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
// import ValidacionGeomapa from "../pages/admin/ValidacionGeomapa";
import GestionCursos from "../pages/admin/GestionCursos";
import GestionApoyos from "../pages/admin/GestionApoyos";
import ModeracionForos from "../pages/admin/ModeracionForos";
import GestionPadron from "@/pages/admin/GestionPadron";
import UsuariosRevision from "../pages/admin/UsuariosRevision";

// Legacy
import Index from "../pages/Index";
import Apoyos from "../pages/Apoyos";
import Cursos from "../pages/Cursos";
import Asistente from "../pages/Asistente";
import Auditoria from "../pages/Auditoria";
import Registro from "../pages/Registro";
import ApoyoDetalle from "../pages/ApoyoDetalle";
import ValidatorDashboard from "../pages/ValidatorDashboard";
import NotFound from "../pages/NotFound";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ====== AUTH ====== */}
      <Route path="/login-productor" element={<LoginProducer />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/registro-productor" element={<RegisterProducer />} />

      {/* ====== RUTAS PROTEGIDAS ====== */}
      <Route element={<LayoutGeneral />}>
        {/* ------ PRODUCTOR ------ */}
        <Route
        index
        element={
            <ProtectedRoute role="Usuario">
              <ProducerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="calendario-agricola"
          element={
            <ProtectedRoute role="Usuario">
              <CalendarioAgricola />
            </ProtectedRoute>
          }
        />
        <Route
          path="geomapa"
          element={
            <ProtectedRoute role="Usuario">
              <Geomapa />
            </ProtectedRoute>
          }
        />
        <Route
          path="solicitar-apoyos"
          element={
            <ProtectedRoute role="Usuario">
              <SolicitarApoyos />
            </ProtectedRoute>
          }
        />

          <Route
          path="registro"
          element={
            <ProtectedRoute role="Usuario">
              <InitialDatosUsuario />
            </ProtectedRoute>
          }
        />

        <Route
          path="cursos-capacitacion"
          element={
            <ProtectedRoute role="Usuario">
              <CursosCapacitacion />
            </ProtectedRoute>
          }
        />
        <Route
          path="foros-discusion"
          element={
            <ProtectedRoute role="Usuario">
              <ForosDiscusion />
            </ProtectedRoute>
          }
        />
        <Route
          path="panel-transparencia"
          element={
            <ProtectedRoute role="Usuario">
              <PanelTransparencia />
            </ProtectedRoute>
          }
        />

        {/* ------ ADMIN ------ */}
        <Route
          path="admin-panel"
          element={
            <ProtectedRoute role="Administracion">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="admin/validacion-geomapa"
          element={
            <ProtectedRoute role="Administracion">
          <Geomapa />
            </ProtectedRoute>
          }
        />


        <Route
          path="admin/validacion-productores"
          element={
            <ProtectedRoute role="Administracion">
              <ValidacionProductores />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/validacion-solicitudes"
          element={
            <ProtectedRoute role="Administracion">
              <ValidacionSolicitudes />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/gestion-cursos"
          element={
            <ProtectedRoute role="Administracion">
              <GestionCursos />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/gestion-apoyos"
          element={
            <ProtectedRoute role="Administracion">
              <GestionApoyos />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/moderacion-foros"
          element={
            <ProtectedRoute role="Administracion">
              <ModeracionForos />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/gestion-padron"
          element={
            <ProtectedRoute role="Administracion">
              <GestionPadron />
            </ProtectedRoute>
          }
        />
                {/* resision ususario */}

        <Route
          path="admin/revision-usuarios"
          element={
            <ProtectedRoute role="Administracion">
              <UsuariosRevision />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/agregar-usuarios"
          element={
            <ProtectedRoute role="Administracion">
              <RegisterProducer />
            </ProtectedRoute>
          }
        />


        {/* ------- Legacy ------- */}
        {/* <Route
          index
          element={
            <ProtectedRoute role="Usuario">
              <Index />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="apoyos"
          element={
            <ProtectedRoute role="Usuario">
              <SolicitarApoyos />
            </ProtectedRoute>
          }
        />
        <Route
          path="apoyo/:id"
          element={
            <ProtectedRoute role="Usuario">
              <ApoyoDetalle />
            </ProtectedRoute>
          }
        />
        <Route
          path="cursos"
          element={
            <ProtectedRoute role="Usuario">
              <CursosCapacitacion />
            </ProtectedRoute>
          }
        />
        <Route
          path="asistente"
          element={
            <ProtectedRoute role="Usuario">
              <Asistente />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="auditoria"
          element={
            <ProtectedRoute role="Usuario">
              <Auditoria />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="registro"
          element={
            <ProtectedRoute role="Usuario">
              <Registro />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="validator-dashboard"
          element={
            <ProtectedRoute role="Usuario">
              <ValidatorDashboard />
            </ProtectedRoute>
          }
        />
         
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
