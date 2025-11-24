import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Users, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import { Input } from "postcss";
import { Button } from "@/components/ui/button";

interface AdminStats {
  label: string;
  value: string;
  subtext: string;
  color: string;
  icon: React.ReactNode;
}

const adminStats: AdminStats[] = [
  {
    label: "Productores Registrados",
    value: "1,247",
    subtext: "+45 esta semana",
    color: "bg-blue-50",
    icon: <Users className="w-6 h-6 text-blue-600" />,
  },
  {
    label: "Solicitudes Validadas",
    value: "856",
    subtext: "+120 esta semana",
    color: "bg-green-50",
    icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
  },
  {
    label: "Apoyos Desembolsados",
    value: "$2.4M MXN",
    subtext: "+$350K esta semana",
    color: "bg-emerald-50",
    icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
  },
  {
    
    label: "Pendientes de Revisión",
    value: "47",
    subtext: "-15 desde ayer",
    color: "bg-amber-50",
    icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
    
  },
];

interface RecentActivity {
  id: string;
  type: "approval" | "submission" | "course" | "notification";
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

const recentActivities: RecentActivity[] = [
  {
    id: "1",
    type: "approval",
    title: "Solicitud Aprobada",
    description: "Apoyo para Siembra de Maíz",
    timestamp: "Hace 2 horas",
    user: "María Elena Vázquez",
  },
  {
    id: "2",
    type: "submission",
    title: "Nueva Solicitud",
    description: "Programa Fertilizantes Orgánicos",
    timestamp: "Hace 4 horas",
    user: "José Antonio Pérez",
  },
  {
    id: "3",
    type: "course",
    title: "Curso Completado",
    description: "Gestión Financiera Agrícola",
    timestamp: "Hace 1 día",
    user: "Carmen Rosa Jiménez",
  },
  {
    id: "4",
    type: "approval",
    title: "Registro Validado",
    description: "Documentación Completa",
    timestamp: "Hace 1 día",
    user: "Roberto Martínez",
  },
];

export default function AdminDashboard() {
  const {user}=useAuth()
  const navigate = useNavigate();

  return (
    <div>
        {/* Title */}
        <div className="mb-8 flex justify-between items-center">
          <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Administrativo: {user.Nombre} {user.Apellido1} {user.Apellido2}
          </h1>
          <p className="text-gray-600 mt-1">
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full align-middle mr-2"></span>
            Sistema SEDARPE · {user.Tipo}
          </p>
          </div>
          <div>
            <Button onClick={() => navigate("/admin/agregar-usuarios")} className="bg-green-600 text-white hover:bg-green-700">
              <PlusCircle className="w-5 h-5 mr-2" />
              Agregar Productor
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {adminStats.map((stat, i) => {
        const isPendientes = stat.label === "Pendientes de Revisión";
        const isProductores = stat.label === "Productores Registrados";

  // --- BOTÓN: Productores Registrados ---
  if (isProductores) {
    return (
      <button
        key={i}
        onClick={() => navigate("/admin/productores")}
        className={`
          p-4 rounded-xl border shadow-sm ${stat.color}
          text-left w-full cursor-pointer hover:shadow-md transition
        `}
      >
        <div className="flex items-center justify-between mb-2">
          {stat.icon}
          <span className="text-xl font-semibold">{stat.value}</span>
        </div>
        <p className="text-sm font-medium">{stat.label}</p>
        <p className="text-xs text-gray-500">{stat.subtext}</p>
      </button>
    );
  }

  // --- BOTÓN: Pendientes de Revisión ---
  if (isPendientes) {
    return (
      <button
        key={i}
        onClick={() => navigate("/admin/revision-usuarios")}
        className={`
          p-4 rounded-xl border shadow-sm ${stat.color}
          text-left w-full cursor-pointer hover:shadow-md transition
        `}
      >
        <div className="flex items-center justify-between mb-2">
          {stat.icon}
          <span className="text-xl font-semibold">{stat.value}</span>
        </div>
        <p className="text-sm font-medium">{stat.label}</p>
        <p className="text-xs text-gray-500">{stat.subtext}</p>
      </button>
    );
  }

  // --- LOS DEMÁS QUEDAN COMO CARDS ---
  return (
    <div
      key={i}
      className={`p-4 rounded-xl border shadow-sm ${stat.color}`}
    >
      <div className="flex items-center justify-between mb-2">
        {stat.icon}
        <span className="text-xl font-semibold">{stat.value}</span>
      </div>
      <p className="text-sm font-medium">{stat.label}</p>
      <p className="text-xs text-gray-500">{stat.subtext}</p>
    </div>
  );
})}

        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/revision-usuarios")}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-left"
          >
            <h3 className="font-bold text-gray-900 mb-2">Panel de Auditoría</h3>
            <p className="text-sm text-gray-600">
              Revisar y validar registros de productores
            </p>
          </button>
          <button 
          onClick={() => navigate("/admin/gestion-apoyos")}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-left">
          
            <h3 className="font-bold text-gray-900 mb-2">
              Gestionar Apoyos
            </h3>
            <p className="text-sm text-gray-600">
              Crear y editar programas de apoyo
            </p>  
          </button>
          <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-left">
            <h3 className="font-bold text-gray-900 mb-2">Reportes</h3>
            <p className="text-sm text-gray-600">
              Descargar reportes y estadísticas
            </p>
          </button>
          <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-left"
           onClick={() => navigate("/admin/gestion-padron")}>
            <h3 className="font-bold text-gray-900 mb-2">Gestion Padron</h3>
            <p className="text-sm text-gray-600">
              Gestion de Preguntas del Formulario
            </p>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

           <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-left"
           onClick={() => navigate("/admin/gestion-cursos")}>
            <h3 className="font-bold text-gray-900 mb-2">Gestion de Cursos</h3>
            <p className="text-sm text-gray-600">
              Crear y editar programas de cursos
            </p>
          </button>
          <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-left"
           onClick={() => navigate("/admin/gestion-padron")}>
            <h3 className="font-bold text-gray-900 mb-2">Gestion de Calendario</h3>
            <p className="text-sm text-gray-600">
              Gestion del calendario 
            </p>
          </button>
           
           <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-left"
           //pendiente 
           onClick={() => navigate("/admin/validacion-geomapa")}>
            <h3 className="font-bold text-gray-900 mb-2">Gestion de Geomapa</h3>
            <p className="text-sm text-gray-600">
              Geomapa de las parcelas  
            </p>  
          </button>
           <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-left"
           onClick={() => navigate("/admin/moderacion-foros")}>
            <h3 className="font-bold text-gray-900 mb-2">Gestion de Foro</h3>
            <p className="text-sm text-gray-600">
              Gestion del foro comunitario 
            </p>
          </button>

        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Actividad Reciente
          </h2>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {activity.type === "approval" && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {activity.type === "submission" && (
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  )}
                  {activity.type === "course" && (
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.user} - {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
