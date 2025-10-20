import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Users, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";

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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel Administrativo
          </h1>
          <p className="text-gray-600 mt-1">
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full align-middle mr-2"></span>
            Sistema SEDARPE · Administrador
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {adminStats.map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} rounded-lg p-6 border border-gray-200 shadow-sm`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                  {stat.label}
                </h3>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-600">{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate("/auditoria")}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-left"
          >
            <h3 className="font-bold text-gray-900 mb-2">Panel de Auditoría</h3>
            <p className="text-sm text-gray-600">
              Revisar y validar registros de productores
            </p>
          </button>
          <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-left">
            <h3 className="font-bold text-gray-900 mb-2">
              Gestionar Programas
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
      </main>
    </div>
  );
}
