import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, ChevronRight, ChevronDown, User, HandHeart, Bot, BookOpen, Map, Calendar, 
  MessageCircle, Clock, TrendingUp, History, CheckCircle2, AlertCircle, 
  FileText, MapPin, ExternalLink,
  Zap
} from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getParaTi } from "@/services/paraTiService"; 
import { Notification } from "@/services/api";
import { useProducerRegister } from "@/hooks/useRegisterProducer";
import { getRegistro } from "@/services/registroService";
import { getCursos } from "@/services/CursosService";
import { getParcelasGeomapa } from "@/services/parcelasService";
import { getUbicaciones } from "@/services/ubicacionEService";

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

// Componente para el Tooltip a la izquierda
const ProfileButton = ({ onClick, icon: Icon, colorClass, borderClass, hoverText, badgeCount = 0 }: any) => (
  <button
    onClick={onClick}
    className={`group relative w-12 h-12 rounded-full ${colorClass} transition-all flex items-center justify-center shadow-md border ${borderClass}`}
  >
    <Icon className="w-6 h-6" />
    {badgeCount > 0 && (
      <span className="absolute top-1 right-1 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"></span>
    )}
    
    {/* Tooltip a la izquierda */}
    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10 shadow-xl">
      {hoverText}
      {/* Triangulito del tooltip */}
      <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
    </span>
  </button>
);

export default function ProducerDashboard() {
  const queryClient = useQueryClient();
  const { user,loadData } = useAuth();
  const navigate = useNavigate();
  const notificationDiv = useRef<HTMLDivElement>(null);
  const historialDiv = useRef<HTMLDivElement>(null);

  const { data: paraTiData, isLoading: loadingParaTi } = useQuery<Notification[]>({
    queryKey: ["ParaTi"],
    queryFn: () => getParaTi({Usos:user.Usos}), 
    initialData: queryClient.getQueryData(["ParaTi"])
  });



  const { dataRegistro, loadingRegistro } = useProducerRegister(user);
  
  const [usuarioA] = useState({
    name: user.Nombre ?? '',
    lastName: `${user.Apellido1} ${user.Apellido2}`,
    initials: user.Nombre ? user.Nombre[0] : '?',
    status: user.Estatus ?? '',
  });

  // Estado para el Toggle del Historial
  const [activeHistoryTab, setActiveHistoryTab] = useState<'supports' | 'courses'>('supports');
  
  // Estado para el Dropdown de Notificaciones
  const [showNotifications, setShowNotifications] = useState(false);

  const services = [
    { id: "support", title: "Solicitar Apoyos", icon: HandHeart, path: "/apoyos", color: "bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200", iconBg: "bg-emerald-600", iconColor: "text-emerald-700" },
    { id: "assistant", title: "Asistente Virtual", icon: Bot, path: "/asistente", color: "bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200", iconBg: "bg-teal-600", iconColor: "text-teal-700" },
    { id: "courses", title: "Cursos y Capacitación", icon: BookOpen, path: "/cursos", color: "bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200", iconBg: "bg-rose-600", iconColor: "text-rose-700" },
    { id: "map", title: "Geomapa de Recursos", icon: Map, path: "/geomapa", color: "bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200", iconBg: "bg-amber-600", iconColor: "text-amber-700" },
    { id: "cal", title: "Calendario Agrícola", icon: Calendar, path: "/calendario-agricola", color: "bg-gradient-to-br from-lime-50 to-lime-100 hover:from-lime-100 hover:to-lime-200", iconBg: "bg-lime-600", iconColor: "text-lime-700" },
    { id: "foro", title: "Foro Comunitario", icon: MessageCircle, path: "/foros-discusion", color: "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200", iconBg: "bg-orange-600", iconColor: "text-orange-700" },
  ];

  const handleNotificationScroll = () => {
    // 1. Abrir el dropdown
    setShowNotifications(true);
    // 2. Hacer scroll
    setTimeout(() => {
        notificationDiv.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleHistorialScroll = () => {
    historialDiv.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const clickNotify=(not:Notification)=>{
    not.color==="rose"?navigate("/cursos",{
      state:{
        cursoId:not.id
      }
    }):not.color==="green"?navigate("/apoyos",{
      state:{
        apoyoId:not.id
      }
    }):null
  }

  // Extraer datos útiles del registro para mostrar en la UI
  const registroInfo = dataRegistro || {};
  const historialApoyos = registroInfo.HistorialApoyo || [];
  const historialCursos = registroInfo.HistorialCursos || [];
  const usuarioDetalle = registroInfo.Usuario || {};
  const citaVerificacion = usuarioDetalle.agendacionCita || {};
  const revisionPerfil = usuarioDetalle.Revision || {};

useEffect(() => {
  if (loadingRegistro || !dataRegistro?.Estado)return 

    const nuevoEstatus = dataRegistro.Estado;
    const estatusActual = user.Estatus;

    if (nuevoEstatus === estatusActual)return
    console.log('que hace aqui')
      try {
        const userStored = JSON.parse(localStorage.getItem('user') || '{}');
         loadData({ ...user, Estatus: nuevoEstatus });
      } catch (error) {
        console.error("Error actualizando localStorage", error);
      }
    
}, [dataRegistro, loadingRegistro, user.Estatus]);

const prefetchHover=(kind:string)=>{
  const commonStaleTime = 1000 * 60 * 3;
  switch (kind){
    case "support":
      return queryClient.prefetchQuery({
        queryKey: ['registroProducer', user?.idRegistro], 
        queryFn: () => getRegistro(user?.idRegistro),
        staleTime:commonStaleTime       
      })
    case "courses":
      return queryClient.prefetchQuery({
       queryKey:["cursosData"],
       queryFn:()=>getCursos(),
        staleTime:commonStaleTime      
      })

    case "map":
        queryClient.prefetchQuery({
        queryKey:["parcelasGeoMapa"],
        queryFn:()=>getParcelasGeomapa(),
        staleTime:commonStaleTime
      })

      queryClient.prefetchQuery({
        queryKey:["ubicacionesGeoMapa"],
        queryFn:()=>getUbicaciones(),
        staleTime:commonStaleTime
      })
      break
    /* case "foro":
      return queryClient.prefetchQuery({
        queryKey: ['registroProducer', user?.idRegistro], 
        queryFn: () => getRegistro(user?.idRegistro),
        staleTime:commonStaleTime      
      }) */
    default:
      return
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Usuario Profile Section */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-emerald-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* Información del Usuario */}
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-3xl md:text-4xl font-extrabold shadow-xl flex-shrink-0 border-4 border-white ring-2 ring-emerald-300">
                  {usuarioA.initials}
                </div>
                <div className="flex-1">
                  <p className="text-lg md:text-xl text-gray-500 font-medium leading-none mb-1">Bienvenido(a),</p>
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
                    {usuarioA.name} {usuarioA.lastName}
                  </h1>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBgColors[usuarioA.status]} border ${statusColors[usuarioA.status].replace('bg-', 'border-')}`}>
                    <span className={`${statusColors[usuarioA.status]} w-2.5 h-2.5 rounded-full shadow-sm`}></span>
                    <span className="text-xs md:text-sm font-semibold text-gray-700">
                      {usuarioA.status}
                    </span>
                  </div>
                </div>
            </div>

            {/* Botones de Acciones */}
            <div className="flex flex-row md:flex-col gap-3 flex-shrink-0 mt-4 md:mt-0">
                <ProfileButton 
                  onClick={() => navigate("/registro")}
                  icon={User}
                  colorClass="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800"
                  borderClass="border-emerald-200"
                  hoverText="Ver mi Perfil"
                />

                <ProfileButton 
                  onClick={handleNotificationScroll}
                  icon={Bell}
                  colorClass="bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-800"
                  borderClass="border-amber-200"
                  hoverText="Ver Alertas"
                  badgeCount={paraTiData?.length}
                />

                <ProfileButton 
                  onClick={handleHistorialScroll}
                  icon={History}
                  colorClass="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800"
                  borderClass="border-blue-200"
                  hoverText="Ver Historial"
                />
            </div>
          </div>
        </div>
        
        {/* Herramientas Grid */}
        <div>
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
                  className={`${service.color} rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-gray-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] group`}
                  onMouseEnter={()=>prefetchHover(service.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className={`${service.iconBg} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-xl transition-all`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <ChevronRight className={`w-6 h-6 text-gray-400 group-hover:${service.iconColor} group-hover:translate-x-1 transition-transform`} />
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
        

        {/* Alertas Section (DROPDOWN) */}
        <div ref={notificationDiv} className="bg-white rounded-3xl shadow-2xl border border-amber-200 scroll-mt-24 overflow-hidden">
          
          {/* Header del Dropdown (Clickable) */}
          <div 
             onClick={() => setShowNotifications(!showNotifications)}
             className="flex items-center justify-between p-6 md:p-8 cursor-pointer hover:bg-amber-50/50 transition-colors select-none"
          >
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-amber-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Lo Mas Reciente
                </h2>
             </div>
             {/* Icono de flecha animado */}
             <div className={`text-gray-400 transition-transform duration-300 ${showNotifications ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-6 h-6" />
             </div>
          </div>

          {/* Contenido Desplegable */}
          {showNotifications && (
              <div className="px-6 md:px-8 pb-8 pt-2 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200 border-t border-amber-100/50">
                {loadingParaTi ? (
                    [...Array(2)].map((_, i) => <NotificationSkeleton key={i} />)
                ) : paraTiData && paraTiData.length > 0 ? (
                    paraTiData.map((notif: Notification) => {
                      const borderColor = notif.color === "green" ? "border-emerald-500" : notif.color === "rose" ? "border-rose-500" : "border-cyan-500";
                      const icon = notif.color === "green" ? HandHeart : notif.color === "rose" ? BookOpen : Zap;
                      const IconComponent = icon;
                      return (
                        <div key={notif.id} className={`flex gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 border-l-4 ${borderColor} transition-all cursor-pointer group shadow-lg hover:shadow-xl`}
                        onClick={()=>clickNotify(notif)}>
                            <div className={`w-10 h-10 rounded-full bg-${notif.color}-100 flex items-center justify-center flex-shrink-0 mt-1`}>
                                <IconComponent className={`w-5 h-5 text-${notif.color}-600`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-extrabold text-gray-800 text-lg mb-1">{notif.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{notif.description}</p>
                              <div className="flex items-center text-xs text-gray-500 font-medium gap-1">
                                  <Clock className="w-3.5 h-3.5"/> <span>{notif.time}</span>
                              </div>
                            </div>
                        </div>
                      )
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p className="font-semibold">¡Todo al día!</p>
                        <p className="text-sm">No hay notificaciones pendientes.</p>
                    </div>
                )}
              </div>
          )}
        </div>

                {/* ------------------- SECCIÓN HISTORIAL Y REVISIONES ------------------- */}
        <div ref={historialDiv} className="grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-mt-24">
          
          {/* COLUMNA IZQUIERDA: REVISIONES (Perfil, Citas, Resumen Apoyos) */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                   <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-blue-700" />
                   </div>
                   <h2 className="text-xl font-bold text-gray-800">Revisiones</h2>
                </div>

                {/* 1. Cita de Verificación del Perfil */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Cita Verificación
                  </h3>
                  {citaVerificacion && citaVerificacion.FechaCita ? (
                     <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                        <p className="font-bold text-gray-800">
                           {new Date(citaVerificacion.FechaCita).toLocaleDateString()}
                           {citaVerificacion.HoraCita && ` - ${citaVerificacion.HoraCita}`}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                           {citaVerificacion.PropositoCita || "Verificación de documentos"}
                        </p>
                        <div className="mt-2 text-xs text-blue-700 bg-blue-100 inline-block px-2 py-1 rounded">
                           Estado: Pendiente
                        </div>
                     </div>
                  ) : (
                     <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-dashed">
                        No hay cita de verificación programada.
                     </div>
                  )}
                </div>

                {/* 2. Estado de Revisión del Perfil */}
                <div className="mb-6">
                   <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                     <FileText className="w-4 h-4" /> Revisión Documental
                   </h3>
                   <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-semibold text-gray-700">Estado Perfil:</span>
                         <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                           registroInfo.Estado === 'Verificado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                         }`}>
                           {registroInfo.Estado || "Pendiente"}
                         </span>
                      </div>
                      {revisionPerfil.ComentariosRevision && (
                         <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0"/>
                            {revisionPerfil.ComentariosRevision}
                         </div>
                      )}
                      {!revisionPerfil.ComentariosRevision && registroInfo.Estado !== 'Verificado' && (
                         <p className="text-xs text-gray-500 mt-1">Tu documentación está en proceso de revisión.</p>
                      )}
                   </div>
                </div>

                {/* 3. Resumen Rápido de Apoyos (Solo lista simple) */}
                <div>
                   <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                     <HandHeart className="w-4 h-4" /> Apoyos Activos
                   </h3>
                   {historialApoyos.length > 0 ? (
                      <ul className="space-y-2">
                        {historialApoyos.slice(0, 3).map((apoyo: any, index: number) => (
                           <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                              <span className="line-clamp-1">{apoyo.nombre_programa}</span>
                           </li>
                        ))}
                        {historialApoyos.length > 3 && (
                           <li className="text-xs text-blue-600 pl-4 font-medium">+ {historialApoyos.length - 3} más...</li>
                        )}
                      </ul>
                   ) : (
                      <p className="text-sm text-gray-400">No has solicitado apoyos aún.</p>
                   )}
                </div>
             </div>
          </div>

          {/* COLUMNA DERECHA: HISTORIAL DETALLADO (Toggle: Apoyos vs Cursos) */}
          <div className="lg:col-span-2">
             <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-100 min-h-[500px]">
                
                {/* Header con Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                         <History className="w-5 h-5 text-purple-700" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">Historial Detallado</h2>
                   </div>

                   {/* Toggle Switch UI */}
                   <div className="bg-gray-100 p-1 rounded-xl flex items-center self-start sm:self-auto">
                      <button 
                        onClick={() => setActiveHistoryTab('supports')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                          activeHistoryTab === 'supports' 
                            ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-gray-200' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                         <HandHeart className="w-4 h-4"/> Mis Apoyos
                      </button>
                      <button 
                        onClick={() => setActiveHistoryTab('courses')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                          activeHistoryTab === 'courses' 
                            ? 'bg-white text-rose-700 shadow-sm ring-1 ring-gray-200' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                         <BookOpen className="w-4 h-4"/> Mis Cursos
                      </button>
                   </div>
                </div>

                {/* Contenido Condicional */}
                <div className="space-y-4 animate-in fade-in duration-300">
                   
                   {/* TAB: APOYOS */}
                   {activeHistoryTab === 'supports' && (
                      <div className="space-y-4">
                         {loadingRegistro ? (
                            <NotificationSkeleton />
                         ) : historialApoyos.length > 0 ? (
                            historialApoyos.map((apoyo: any, idx: number) => (
                               <div key={apoyo.idApoyo || idx} className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 transition-colors group">
                                  <div className="flex justify-between items-start mb-2">
                                     <h4 className="font-bold text-emerald-900 text-lg pr-4">{apoyo.nombre_programa}</h4>
                                     {apoyo.agendacionCita?.FechaCita && (
                                         <span className="text-[10px] font-bold bg-white border border-emerald-200 text-emerald-600 px-2 py-1 rounded-full whitespace-nowrap">
                                            Cita: {new Date(apoyo.agendacionCita.FechaCita).toLocaleDateString()}
                                         </span>
                                     )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">{apoyo.descripcion}</p>
                                  
                                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 border-t border-emerald-100 pt-3">
                                     <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-100">
                                        <TrendingUp className="w-3 h-3 text-emerald-500"/> 
                                        {apoyo.tipo_objetivo}: {apoyo.objetivo}
                                     </span>
                                     {apoyo.costo && (
                                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-100">
                                           💰 Costo: {apoyo.costo}
                                        </span>
                                     )}
                                  </div>
                               </div>
                            ))
                         ) : (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                               <HandHeart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                               <p>No tienes historial de apoyos registrado.</p>
                            </div>
                         )}
                      </div>
                   )}

                   {/* TAB: CURSOS */}
                   {activeHistoryTab === 'courses' && (
                      <div className="space-y-4">
                         {loadingRegistro ? (
                            <NotificationSkeleton />
                         ) : historialCursos.length > 0 ? (
                            historialCursos.map((curso: any, idx: number) => (
                               <div key={curso.idCurso || idx} className="p-5 rounded-2xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50 transition-colors group relative">
                                  <div className="flex items-start gap-4">
                                     <div className="w-12 h-12 rounded-lg bg-white border border-rose-100 text-rose-600 flex items-center justify-center shadow-sm shrink-0">
                                        <BookOpen className="w-6 h-6" />
                                     </div>
                                     <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-lg">{curso.Titulo}</h4>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{curso.Descripcion}</p>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500">
                                           <div className="flex items-center gap-1.5">
                                              <MapPin className="w-3.5 h-3.5 text-rose-400"/>
                                              <span className="truncate">{curso.DireccionUbicacion}</span>
                                           </div>
                                           <div className="flex items-center gap-1.5">
                                              <Calendar className="w-3.5 h-3.5 text-rose-400"/>
                                              <span>
                                                 {curso.FechaCurso && curso.FechaCurso[0] 
                                                   ? new Date(curso.FechaCurso[0]).toLocaleDateString() 
                                                   : "Fecha por definir"}
                                              </span>
                                           </div>
                                           <div className="flex items-center gap-1.5">
                                               <span className={`w-2 h-2 rounded-full ${curso.Modalidad === 'Presencial' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                                               {curso.Modalidad}
                                           </div>
                                        </div>

                                        {curso.Url && (
                                           <a href={curso.Url} target="_blank" rel="noopener noreferrer" className="absolute top-5 right-5 text-gray-400 hover:text-rose-600 transition-colors">
                                              <ExternalLink className="w-5 h-5" />
                                           </a>
                                        )}
                                     </div>
                                  </div>
                               </div>
                            ))
                         ) : (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                               <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                               <p>No tienes cursos registrados.</p>
                            </div>
                         )}
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}