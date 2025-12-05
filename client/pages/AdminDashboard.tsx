import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  FileText,
  Map,
  CalendarDays,
  MessageSquare,
  LayoutDashboard,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import { Button } from "@/components/ui/button";
import { getApoyos } from "@/services/ApoyoService";
import { getCursos } from "@/services/CursosService";
import { useRegistros } from "@/hooks/useRegistros";

// --- Interfaces ---
interface AdminStats {
  label: string;
  value: string;
  subtext: string;
  color: string; 
  textColor: string; 
  icon: React.ReactNode;
  action?: () => void;
}

interface RecentActivity {
  id: string;
  type: "approval" | "submission" | "course" | "notification";
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

// --- Mock Data (Activity) ---
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
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { pendientesLenght, productores, revisados, loadingRegistros } = useRegistros();

  const [counts, setCounts] = useState({
    apoyos: "...",
    cursos: "...",
    total: "..."
  });

  // --- Lógica del LocalStorage y Data Fetching ---
  useEffect(() => {
    const fetchAndCacheData = async () => {
      try {
        const cached = localStorage.getItem("admin_dashboard_counts");
        if (cached) {
          const parsed = JSON.parse(cached);
          setCounts(prev => prev.apoyos === "..." ? parsed : prev);
        }
      } catch (e) {
        console.warn("Error leyendo caché local:", e);
      }

      try {
        const [apoyosData, cursosData] = await Promise.all([
          getApoyos(),
          getCursos()
        ]);

        const newCounts = {
          apoyos: apoyosData.length.toString(),
          cursos: cursosData.length.toString(),
          total: (apoyosData.length + cursosData.length).toString()
        };

        setCounts(newCounts);
        localStorage.setItem("admin_dashboard_counts", JSON.stringify(newCounts));

      } catch (error) {
        console.error("Error cargando estadísticas del dashboard:", error);
      }
    };

    fetchAndCacheData();
  }, []); 


  const stats: AdminStats[] = [
    {
      label: "Productores Registrados",
      value: loadingRegistros ? "..." : productores.length.toString(),
      subtext: "Base de datos activa",
      color: "bg-blue-50 border-blue-100",
      textColor: "text-blue-600",
      icon: <Users className="w-6 h-6" />,
      action: () => navigate("/admin/registrados-productores")
    },
    {
      label: "Solicitudes Validadas",
      value: loadingRegistros ? "..." : revisados,
      subtext: "Procesadas exitosamente",
      color: "bg-emerald-50 border-emerald-100",
      textColor: "text-emerald-600",
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
    {
      label: "Recursos Disponibles",
      value: counts.total,
      subtext: `${counts.apoyos} Apoyos / ${counts.cursos} Cursos`,
      color: "bg-indigo-50 border-indigo-100",
      textColor: "text-indigo-600",
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      label: "Pendientes de Revisión",
      value: loadingRegistros ? "..." : pendientesLenght,
      subtext: "Requieren atención",
      color: "bg-amber-50 border-amber-100",
      textColor: "text-amber-600",
      icon: <AlertCircle className="w-6 h-6" />,
      action: () => navigate("/admin/revision-usuarios")
    },
  ];

  const quickActions = [
    {
      title: "Auditoría de Usuarios",
      desc: "Validar documentación y registros pendientes",
      icon: <FileText className="w-5 h-5" />,
      path: "/admin/revision-usuarios",
      color: "text-blue-600 bg-blue-50"
    },
    {
      title: "Gestionar Apoyos",
      desc: "Crear, editar o cerrar programas de apoyo",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/admin/gestion-apoyos",
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      title: "Geomapa Parcelario",
      desc: "Visualizar distribución geográfica de tierras",
      icon: <Map className="w-5 h-5" />,
      path: "/admin/validacion-geomapa",
      color: "text-indigo-600 bg-indigo-50"
    },
    {
      title: "Catálogo de Cursos",
      desc: "Administrar oferta educativa vigente",
      icon: <TrendingUp className="w-5 h-5" />,
      path: "/admin/gestion-cursos",
      color: "text-purple-600 bg-purple-50"
    },
    {
      title: "Gestión del Padrón",
      desc: "Administrar preguntas y formularios",
      icon: <Users className="w-5 h-5" />,
      path: "/admin/gestion-padron",
      color: "text-orange-600 bg-orange-50"
    },
    {
      title: "Foro Comunitario",
      desc: "Moderación de discusiones y temas",
      icon: <MessageSquare className="w-5 h-5" />,
      path: "/admin/moderacion-foros",
      color: "text-pink-600 bg-pink-50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* === HEADER === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Panel Administrativo
            </h1>
            <div className="flex items-center gap-2 mt-2 text-slate-500">
                <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-sm font-medium">Bienvenido, {user.Nombre} {user.Apellido1}</span>
                <span className="text-slate-300">•</span>
                <span className="text-sm bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">{user.Tipo}</span>
            </div>
          </div>
          <Button
            onClick={() => navigate("/admin/agregar-usuarios")}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Nuevo Productor
          </Button>
        </div>

        {/* === STATS GRID === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              onClick={stat.action ? stat.action : undefined}
              className={`
                group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm 
                transition-all duration-300 hover:shadow-md hover:-translate-y-1
                ${stat.action ? 'cursor-pointer' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.color} ${stat.textColor} transition-colors`}>
                    {stat.icon}
                </div>
                {stat.action && (
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                )}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</h3>
                <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* === ACCIONES RÁPIDAS (2/3 del ancho) === */}
            <div className="xl:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-slate-400" />
                        Accesos Directos
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(action.path)}
                            className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200 transition-all group text-left"
                        >
                            <div className={`p-3 rounded-xl ${action.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                                {action.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 group-hover:text-green-700 transition-colors">
                                    {action.title}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                    {action.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="xl:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-slate-400" />
                        Actividad Reciente
                    </h2>

                    <div className="space-y-8 ">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="relative flex items-start group">
                                <div className="absolute left-0 top-1 h-3 w-3 ml-[14.5px] rounded-full border border-white bg-slate-300 shadow group-hover:bg-green-500 transition-colors"></div>
                                <div className="ml-10 w-full">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-green-700 transition-colors">
                                            {activity.title}
                                        </p>
                                        <time className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                                            {activity.timestamp}
                                        </time>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {activity.user}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 italic">
                                        {activity.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <button className="text-xs font-semibold text-slate-400 hover:text-green-600 transition-colors uppercase tracking-wider">
                            Ver todo el historial
                        </button>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}