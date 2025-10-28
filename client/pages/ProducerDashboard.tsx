import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, User } from "lucide-react";
import Header from "@/components/Header";

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

export default function ProducerDashboard() {
  const navigate = useNavigate();
  const [user] = useState({
    name: "Jorge",
    lastName: "García",
    initials: "J",
    status: "Verificado",
  });

  const services = [
    {
      id: "support",
      title: "Solicitar Apoyos",
      icon: "🤝",
      path: "/apoyos",
      color: "bg-green-50 hover:bg-green-100",
      iconBg: "bg-green-500",
    },
    {
      id: "assistant",
      title: "Asistente virtual",
      icon: "💬",
      path: "/asistente",
      color: "bg-cyan-50 hover:bg-cyan-100",
      iconBg: "bg-cyan-500",
    },
    {
      id: "courses",
      title: "Cursos y Capacitación",
      icon: "📚",
      path: "/cursos",
      color: "bg-green-50 hover:bg-green-100",
      iconBg: "bg-green-500",
    },
    {
      id: "map",
      title: "Geomapa de Recursos",
      icon: "🗺️",
      path: "/geomapa",
      color: "bg-cyan-50 hover:bg-cyan-100",
      iconBg: "bg-cyan-500",
    },
  ];

  return (
    <div>
        {/* User Profile Section */}
        <div className="mb-8">
          <div className="flex items-start gap-4 bg-white rounded-lg p-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {user.initials}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name} {user.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-600">Estatus: {user.status}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/registro")}
              className="text-gray-500 hover:text-gray-700"
            >
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Services Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Servicios Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => navigate(service.path)}
                className={`${service.color} rounded-lg p-6 text-left transition-all duration-200 cursor-pointer border border-gray-200 shadow-sm hover:shadow-md`}
              >
                <div
                  className={`${service.iconBg} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}
                >
                  <span className="text-xl">{service.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{service.title}</h3>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts and Notifications */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">
              Alertas y Notificaciones
            </h2>
          </div>

          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex gap-4 pb-4 border-l-4 border-gray-200 pl-4"
                style={{
                  borderLeftColor:
                    notif.color === "green"
                      ? "#22c55e"
                      : notif.color === "blue"
                        ? "#3b82f6"
                        : "#06b6d4",
                }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {notif.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notif.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{notif.time}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
