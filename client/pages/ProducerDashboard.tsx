import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, User, HandHeart, Bot, BookOpen, Map, Calendar, MessageCircle } from "lucide-react";
import { useAuth } from "@/providers/authProvider";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "¡Nuevo Apoyo disponible!",
    description: "Programa de fertilizantes 2024",
    time: "Hace 2 horas",
    color: "green",
  },
  {
    id: "2",
    title: "Tu solicitud ha sido aprobada",
    description: "Apoyo para semillas de maíz",
    time: "Hace 1 día",
    color: "blue",
  },
  {
    id: "3",
    title: "Recordatorio",
    description: "Curso de agricultura sostenible mañana",
    time: "Hace 1 hora",
    color: "cyan",
  },
];

const statusColors: Record<string, string> = {
  Verificado: "bg-emerald-600",
  Pendiente: "bg-amber-500",
  Rechazado: "bg-red-600",
};

const statusBgColors: Record<string, string> = {
  Verificado: "bg-emerald-50",
  Pendiente: "bg-amber-50",
  Rechazado: "bg-red-50",
};

export default function ProducerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [usuarioA] = useState({
    name: user.Nombre ?? '',
    lastName: `${user.Apellido1} ${user.Apellido2}`,
    initials: user.Nombre[0] ?? '',
    status: user.Estatus ?? '',
  });

  const services = [
    {
      id: "support",
      title: "Solicitar Apoyos",
      icon: HandHeart,
      path: "/apoyos",
      color: "bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200",
      iconColor: "text-emerald-700",
      iconBg: "bg-emerald-600",
    },
    {
      id: "assistant",
      title: "Asistente Virtual",
      icon: Bot,
      path: "/asistente",
      color: "bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200",
      iconColor: "text-teal-700",
      iconBg: "bg-teal-600",
    },
    {
      id: "courses",
      title: "Cursos y Capacitación",
      icon: BookOpen,
      path: "/cursos",
      color: "bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200",
      iconColor: "text-rose-800",
      iconBg: "bg-rose-700",
    },
    {
      id: "map",
      title: "Geomapa de Recursos",
      icon: Map,
      path: "/geomapa",
      color: "bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200",
      iconColor: "text-amber-800",
      iconBg: "bg-amber-600",
    },
    {
      id: "cal",
      title: "Calendario Agrícola",
      icon: Calendar,
      path: "/calendario-agricola",
      color: "bg-gradient-to-br from-lime-50 to-lime-100 hover:from-lime-100 hover:to-lime-200",
      iconColor: "text-lime-800",
      iconBg: "bg-lime-600",
    },
    {
      id: "foro",
      title: "Foro Comunitario",
      icon: MessageCircle,
      path: "/foros-discusion",
      color: "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200",
      iconColor: "text-orange-800",
      iconBg: "bg-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Usuario Profile Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-emerald-100">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg flex-shrink-0">
                {usuarioA.initials}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {usuarioA.name} {usuarioA.lastName}
                </h1>
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl ${statusBgColors[usuarioA.status]} border-2 ${statusColors[usuarioA.status].replace('bg-', 'border-')}`}>
                  <span className={`${statusColors[usuarioA.status]} w-3 h-3 rounded-full shadow-sm`}></span>
                  <span className="text-base font-semibold text-gray-700">
                    Estatus: {usuarioA.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/registro")}
                className="w-14 h-14 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all flex items-center justify-center shadow-sm"
              >
                <User className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Services Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-emerald-600 rounded-full"></span>
            Servicios Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => navigate(service.path)}
                  className={`${service.color} rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-gray-300 shadow-md hover:shadow-xl hover:scale-105 group`}
                >
                  <div className={`${service.iconBg} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:shadow-lg transition-all`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">
                    {service.title}
                  </h3>
                  <div className="mt-3 flex items-center text-gray-600 text-sm font-medium">
                    <span>Acceder</span>
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerts and Notifications */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-amber-100">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-amber-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Alertas y Notificaciones
            </h2>
          </div>

          <div className="space-y-4">
            {notifications.map((notif) => {
              const borderColor =
                notif.color === "green"
                  ? "#10b981"
                  : notif.color === "blue"
                    ? "#3b82f6"
                    : "#06b6d4";
              
              return (
                <div
                  key={notif.id}
                  className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 border-l-4 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  style={{ borderLeftColor: borderColor }}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base mb-1">
                      {notif.title}
                    </h3>
                    <p className="text-base text-gray-600 mb-2">
                      {notif.description}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      {notif.time}
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 flex-shrink-0 mt-2 transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}