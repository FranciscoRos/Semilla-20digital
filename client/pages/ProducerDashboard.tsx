import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, ChevronRight, User, HandHeart, Bot, BookOpen, Map, Calendar, 
  MessageCircle, Leaf, Zap, Clock, TrendingUp 
} from "lucide-react"; // Añadí iconos nuevos
import { useAuth } from "@/providers/authProvider";
import { useQuery } from "@tanstack/react-query";
import { getParaTi } from "@/services/paraTiService"; 
import { Notification } from "@/services/api";


// Componente para Skeleton Loading
const NotificationSkeleton = () => (
  <div className="flex gap-4 p-5 rounded-xl bg-gray-50 border-l-4 border-gray-200 animate-pulse">
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

// Descripción para los servicios
const serviceDescriptions: Record<string, string> = {
    support: "Accede a convocatorias y tramita ayuda económica.",
    assistant: "Obtén consejos agronómicos en tiempo real.",
    courses: "Explora talleres y capacitaciones relevantes para tu actividad.",
    map: "Visualiza recursos, centros de acopio y ubicaciones clave.",
    cal: "Consulta fechas óptimas de siembra, cosecha y eventos.",
    foro: "Comparte experiencias y resuelve dudas con la comunidad.",
};

// --- COMPONENTE PRINCIPAL ---

const statusColors: Record<string, string> = {
  Verificado: "bg-emerald-600",
  Activo: "bg-emerald-600",
  Pendiente: "bg-amber-500",
  Rechazado: "bg-red-600",
};

const statusBgColors: Record<string, string> = {
  Verificado: "bg-emerald-50",
  Activo: "bg-emerald-50",
  Pendiente: "bg-amber-50",
  Rechazado: "bg-red-50",
};

export default function ProducerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notificationDiv = useRef<HTMLDivElement>(null);

  const { data: paraTiData, isLoading: loadingParaTi } = useQuery<Notification[]>({
    queryKey: ["ParaTi"],
    queryFn: () => getParaTi({Usos:user.Usos}), 
  });
  
  const [usuarioA] = useState({
    name: user.Nombre ?? '',
    lastName: `${user.Apellido1} ${user.Apellido2}`,
    initials: user.Nombre ? user.Nombre[0] : '?',
    status: user.Estatus ?? '',
  });

  const services = [
    {
      id: "support",
      title: "Solicitar Apoyos",
      icon: HandHeart,
      path: "/apoyos",
      color: "bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200",
      iconBg: "bg-emerald-600",
      iconColor: "text-emerald-700",
    },
    {
      id: "assistant",
      title: "Asistente Virtual",
      icon: Bot,
      path: "/asistente",
      color: "bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200",
      iconBg: "bg-teal-600",
      iconColor: "text-teal-700",
    },
    {
      id: "courses",
      title: "Cursos y Capacitación",
      icon: BookOpen,
      path: "/cursos",
      color: "bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200",
      iconBg: "bg-rose-600",
      iconColor: "text-rose-700",
    },
    {
      id: "map",
      title: "Geomapa de Recursos",
      icon: Map,
      path: "/geomapa",
      color: "bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200",
      iconBg: "bg-amber-600",
      iconColor: "text-amber-700",
    },
    {
      id: "cal",
      title: "Calendario Agrícola",
      icon: Calendar,
      path: "/calendario-agricola",
      color: "bg-gradient-to-br from-lime-50 to-lime-100 hover:from-lime-100 hover:to-lime-200",
      iconBg: "bg-lime-600",
      iconColor: "text-lime-700",
    },
    {
      id: "foro",
      title: "Foro Comunitario",
      icon: MessageCircle,
      path: "/foros-discusion",
      color: "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200",
      iconBg: "bg-orange-600",
      iconColor: "text-orange-700",
    },
  ];

  const handleNotificationScroll = () => {
    if(notificationDiv.current) {
        notificationDiv.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    } else {
        console.log('Notification div reference not found');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Usuario Profile Section */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-emerald-200">
            <div className="flex items-center justify-between gap-6">
              
              {/* Información del Usuario */}
              <div className="flex items-center gap-6 flex-1">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-4xl font-extrabold shadow-xl flex-shrink-0 border-4 border-white ring-2 ring-emerald-300">
                    {usuarioA.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-xl text-gray-500 font-medium leading-none">Bienvenido(a),</p>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                      {usuarioA.name} {usuarioA.lastName}
                    </h1>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBgColors[usuarioA.status]} border ${statusColors[usuarioA.status].replace('bg-', 'border-')}`}>
                      <span className={`${statusColors[usuarioA.status]} w-3 h-3 rounded-full shadow-sm`}></span>
                      <span className="text-sm font-semibold text-gray-700">
                        {usuarioA.status}
                      </span>
                    </div>
                  </div>
              </div>

              {/* Botones de Acciones */}
              <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={() => navigate("/registro")}
                    className="w-12 h-12 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800 transition-all flex items-center justify-center shadow-md border border-emerald-200"
                    title="Ver Perfil"
                  >
                    <User className="w-6 h-6" />
                  </button>

                  <button
                    onClick={handleNotificationScroll}
                    className="relative w-12 h-12 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-800 transition-all flex items-center justify-center shadow-md border border-amber-200"
                    title="Ver Alertas"
                  >
                    <Bell className="w-6 h-6" />
                    {/* Indicador de nuevas notificaciones (ejemplo) */}
                    {paraTiData?.length > 0 && (
                        <span className="absolute top-1 right-1 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"></span>
                    )}
                  </button>
              </div>

            </div>
          </div>
        </div>
        
        {/* ------------------- MAIN SERVICES GRID ------------------- */}
        
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Herramientas para el Productor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => navigate(service.path)}
                  // Diseño más moderno con borde suave y sombra marcada
                  className={`${service.color} rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-gray-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] group`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`${service.iconBg} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-xl transition-all`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <ChevronRight className={`w-6 h-6 text-gray-400 group-hover:${service.iconColor} group-hover:translate-x-1 transition-transform"`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {serviceDescriptions[service.id]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------- ALERTS AND NOTIFICATIONS ------------------- */}
        
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-amber-200">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-amber-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Alertas y Oportunidades Personalizadas
            </h2>
          </div>

          <div ref={notificationDiv} className="space-y-4 pt-2">
            
            {/* Manejo de Carga y Datos */}
            {loadingParaTi ? (
                // Muestra 3 skeletons mientras carga
                [...Array(3)].map((_, i) => <NotificationSkeleton key={i} />)
            ) : paraTiData && paraTiData.length > 0 ? (
                // Muestra las notificaciones
                paraTiData.map((notif: Notification) => {
                  const borderColor =
                    notif.color === "green"
                      ? "border-emerald-500"
                      : notif.color === "blue"
                        ? "border-blue-500"
                        : "border-cyan-500";
                  
                  const icon = notif.color === "green" ? HandHeart : notif.color === "blue" ? BookOpen : Zap;
                  const IconComponent = icon;

                  return (
                    <div
                      key={notif.id}
                      className={`flex gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 border-l-4 ${borderColor} transition-all cursor-pointer group shadow-lg hover:shadow-xl`}
                    >
                      {/* Icono de tipo de notificación */}
                      <div className={`w-10 h-10 rounded-full bg-${notif.color}-100 flex items-center justify-center flex-shrink-0 mt-1`}>
                          <IconComponent className={`w-5 h-5 text-${notif.color}-600`} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-extrabold text-gray-800 text-lg mb-1 leading-tight">
                          {notif.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notif.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 font-medium gap-1">
                            <Clock className="w-3.5 h-3.5"/>
                            <span>{notif.time}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 flex-shrink-0 mt-2 transition-all" />
                    </div>
                  );
                })
            ) : (
                // Mensaje si no hay datos o la lista está vacía
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="font-semibold">¡Todo al día!</p>
                    <p className="text-sm">No hay nuevas alertas ni oportunidades personalizadas.</p>
                </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}