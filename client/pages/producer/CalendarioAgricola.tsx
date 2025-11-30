import { useState, useEffect } from "react";
import {
  Cloud,
  Droplets,
  Moon,
  Sun,
  Wind,
  Sprout,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Thermometer,
  Fish,
  Beef,
  Tractor,
  Info
} from "lucide-react";
import { useAuth } from "@/providers/authProvider";


// Datos de ejemplo (Los que ya tienes en MASTER_CALENDAR)
const TIMELINE_DATA = [
  { name: "Maíz", type: "siembra", startMonth: 4, endMonth: 6, color: "bg-yellow-400" },
  { name: "Maíz", type: "cosecha", startMonth: 9, endMonth: 11, color: "bg-yellow-600" },
  { name: "Frijol", type: "siembra", startMonth: 5, endMonth: 7, color: "bg-amber-500" },
  { name: "Chile", type: "siembra", startMonth: 3, endMonth: 5, color: "bg-red-500" },
];

function TimelineAgricola() {
  const [startMonthWindow, setStartMonthWindow] = useState(new Date().getMonth()); // Empezar vista en el mes actual

  // Calcular el rango visible (ej. 4 meses visibles en móvil)
  const visibleMonths = 5; 
  
  // Función para mover la ventana de tiempo
  const moveTimeline = (direction: 'left' | 'right') => {
    setStartMonthWindow(prev => {
      if (direction === 'left') return Math.max(0, prev - 1);
      return Math.min(11 - visibleMonths + 1, prev + 1);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Cronograma de Cultivos</h3>
          <p className="text-xs text-gray-500">Ventanas de actividad sugeridas</p>
        </div>
        
        {/* Controles de Navegación */}
        <div className="flex gap-2">
          <button 
            onClick={() => moveTimeline('left')}
            disabled={startMonthWindow === 0}
            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => moveTimeline('right')}
            disabled={startMonthWindow >= 12 - visibleMonths}
            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid del Timeline */}
      <div className="relative">
        {/* Encabezados de Meses */}
        <div className="grid grid-cols-5 mb-4 text-center border-b border-gray-100 pb-2">
          {Array.from({ length: visibleMonths }).map((_, i) => {
            const monthIndex = startMonthWindow + i;
            // Resaltar mes actual
            const isCurrentMonth = monthIndex === new Date().getMonth();
            return (
              <div key={i} className={`text-sm font-medium ${isCurrentMonth ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                {MONTHS[monthIndex]}
                {isCurrentMonth && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mx-auto mt-1"></div>}
              </div>
            );
          })}
        </div>

        {/* Filas de Cultivos */}
        <div className="space-y-4">
          {/* Agrupamos por nombre de cultivo para que se vea ordenado */}
          {["Maíz", "Frijol", "Chile"].map((cropName) => (
            <div key={cropName} className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Sprout className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-700">{cropName}</span>
              </div>
              
              {/* La pista de fondo (track) */}
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative grid grid-cols-5">
                 {/* Divisiones verticales sutiles */}
                 {[0,1,2,3,4].map(col => (
                    <div key={col} className="border-r border-gray-200 h-full w-full"></div>
                 ))}

                 {/* Las barras de actividad */}
                 {TIMELINE_DATA.filter(d => d.name === cropName).map((activity, idx) => {
                    // Lógica para posicionar la barra
                    // (Simplificada para el ejemplo: calcula si la actividad cae en la ventana visible)
                    const activityStart = activity.startMonth; // ej: 4 (Mayo)
                    const activityEnd = activity.endMonth;     // ej: 6 (Julio)
                    
                    // Si la actividad no es visible en esta ventana, null
                    if (activityEnd < startMonthWindow || activityStart > startMonthWindow + visibleMonths) return null;

                    // Calcular inicio y ancho relativo (CSS Grid logic o Absoluta)
                    // Para este ejemplo simple, usaremos lógica condicional visual
                    // En producción usarías cálculos de % de ancho
                    
                    return null; // *Nota abajo sobre implementación real*
                 })}
              </div>
              
              {/* Implementación Visual Simplificada con CSS Grid para el ejemplo */}
              <div className="h-3 w-full absolute top-5 left-0 grid grid-cols-5 gap-0 pointer-events-none">
                 {Array.from({ length: visibleMonths }).map((_, i) => {
                    const currentRenderMonth = startMonthWindow + i;
                    // Buscar si hay actividad en este mes específico
                    const active = TIMELINE_DATA.find(d => 
                        d.name === cropName && 
                        currentRenderMonth >= d.startMonth && 
                        currentRenderMonth <= d.endMonth
                    );
                    
                    if (!active) return <div key={i}></div>;
                    
                    // Clases para bordes redondeados
                    const isStart = currentRenderMonth === active.startMonth;
                    const isEnd = currentRenderMonth === active.endMonth;
                    const roundedClass = isStart && isEnd ? 'rounded-full' : isStart ? 'rounded-l-full' : isEnd ? 'rounded-r-full' : '';

                    return (
                        <div key={i} className={`${active.color} ${roundedClass} h-full opacity-80 shadow-sm`}></div>
                    );
                 })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex gap-4 text-xs text-gray-500 justify-center">
         <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> Siembra</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-600"></div> Cosecha</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Cuidados</div>
      </div>
    </div>
  );
}


const MASTER_CALENDAR = [
  // --- AGRICULTURA ---
  { name: "Maíz", type: "agricultura", siembra: [4, 5, 6], cosecha: [9, 10, 11], color: "bg-yellow-100 text-yellow-800", icon: Sprout },
  { name: "Frijol", type: "agricultura", siembra: [5, 6, 7], cosecha: [8, 9, 10], color: "bg-amber-100 text-amber-800", icon: Sprout },
  { name: "Chile Habanero", type: "agricultura", siembra: [3, 4, 5], cosecha: [7, 8, 9, 10], color: "bg-red-100 text-red-800", icon: Sprout },
  { name: "Tomate", type: "agricultura", siembra: [9, 10, 11], cosecha: [12, 1, 2], color: "bg-rose-100 text-rose-800", icon: Sprout },
  { name: "Calabaza", type: "agricultura", siembra: [4, 5, 6], cosecha: [7, 8, 9], color: "bg-orange-100 text-orange-800", icon: Sprout },
  { name: "Papaya", type: "agricultura", siembra: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], cosecha: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], color: "bg-orange-50 text-orange-700", icon: Sprout },
  { name: "Pitahaya", type: "agricultura", siembra: [4, 5], cosecha: [6, 7, 8, 9, 10], color: "bg-pink-100 text-pink-800", icon: Sprout },
  { name: "Cítricos", type: "agricultura", siembra: [5, 6, 7], cosecha: [9, 10, 11, 12, 1], color: "bg-lime-100 text-lime-800", icon: Sprout },
  
  // --- GANADERÍA (Actividades sugeridas por mes) ---
  { name: "Vacas", type: "ganaderia", actividad: "Vacunación y Desparasitación", meses: [4, 10], color: "bg-slate-100 text-slate-800", icon: Beef },
  { name: "Vacas", type: "ganaderia", actividad: "Suplementación Mineral (Seca)", meses: [2, 3, 4], color: "bg-slate-100 text-slate-800", icon: Beef },
  { name: "Ovinos", type: "ganaderia", actividad: "Esquila", meses: [3, 4], color: "bg-stone-100 text-stone-800", icon: Beef },
  
  // --- PESCA (Temporadas) ---
  { name: "Mojarra", type: "pesca", actividad: "Siembra de Alevines", meses: [3, 4, 9, 10], color: "bg-blue-100 text-blue-800", icon: Fish },
  { name: "Mojarra", type: "pesca", actividad: "Cosecha Intensiva", meses: [12, 4], color: "bg-blue-100 text-blue-800", icon: Fish },
];

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Función auxiliar de fases lunares (Mantenida igual)
function getMoonPhase(date: Date) {
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();
    let c = 0, e = 0, jd = 0, b = 0;
    let y = year;
    if (month < 3) { y--; month += 12; }
    ++month;
    c = 365.25 * y; e = 30.6 * month;
    jd = c + e + day - 694039.09; jd /= 29.5305882;
    // @ts-ignore
    b = parseInt(jd); jd -= b; b = Math.round(jd * 8);
    if (b >= 8) b = 0;
    const phases = [
      { name: "Luna Nueva", icon: "🌑", ideal: "Podas y reposo" },
      { name: "Creciente", icon: "🌒", ideal: "Siembra frutas" },
      { name: "Cuarto Creciente", icon: "🌓", ideal: "Hortalizas y hojas" },
      { name: "Gibosa Creciente", icon: "🌔", ideal: "Cereales y granos" },
      { name: "Luna Llena", icon: "🌕", ideal: "Cosecha" },
      { name: "Gibosa Menguante", icon: "🌖", ideal: "Control plagas" },
      { name: "Cuarto Menguante", icon: "🌗", ideal: "Raíces y tubérculos" },
      { name: "Menguante", icon: "🌘", ideal: "Abonado suelo" },
    ];
    return phases[b];
}

export default function CalendarioAgricola() {
  // MOCK DE AUTENTICACIÓN (Reemplazar con tu hook real)
  const { user } = useAuth();
  

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
  const [weather, setWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Normalizar tags del usuario para búsqueda
  const userSpecificInterests = user.Usos.flatMap(u => u.UsosEspecificos.map(s => s.toLowerCase()));
  const userGeneralInterests = user.Usos.map(u => u.UsoGeneral.toLowerCase());

  // Lógica de Clima (Open-Meteo)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=18.5&longitude=-88.3&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FCancun`
        );
        const data = await res.json();
        setWeather(data);
      } catch (e) {
        console.error("Error clima", e);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, []);

  // Lógica de Filtrado Inteligente
  const getActivitiesForMonth = (monthIndex: number) => {
    // 1. Actividades "Mis Cultivos/Animales"
    const myActivities = MASTER_CALENDAR.filter(item => {
      // Coincidencia laxa (ej: "Vacas" coincide con "Ganado Bovino" si configuramos alias, aquí es directo)
      const isMyInterest = userSpecificInterests.some(interest => item.name.toLowerCase().includes(interest));
      
      if (!isMyInterest) return false;

      // Verificar si hay acción este mes
      if (item.type === 'agricultura') {
        return item.siembra?.includes(monthIndex + 1) || item.cosecha?.includes(monthIndex + 1);
      }
      return item.meses?.includes(monthIndex + 1);
    });

    // 2. Recomendaciones (Lo que NO tengo pero es temporada)
    const recommendations = MASTER_CALENDAR.filter(item => {
      const isMyInterest = userSpecificInterests.some(interest => item.name.toLowerCase().includes(interest));
      if (isMyInterest) return false; // Ya lo tengo
      
      // Solo recomendar si es temporada de INICIO (Siembra o actividad principal)
      if (item.type === 'agricultura') return item.siembra?.includes(monthIndex + 1);
      return false; // No recomendamos comprar vacas random
    });

    return { myActivities, recommendations };
  };

  const { myActivities, recommendations } = getActivitiesForMonth(selectedMonthIndex);
  const moonPhase = getMoonPhase(new Date(new Date().getFullYear(), selectedMonthIndex, 15));

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Personalizado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Hola, <span className="text-green-600">{user.Nombre} {user.Apellido1}</span>
            </h1>
            <p className="text-gray-500 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Tu planificación para {MONTHS[selectedMonthIndex]}
            </p>
          </div>
          
          {/* Navegación Meses */}
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            <button 
              onClick={() => setSelectedMonthIndex((prev) => (prev - 1 + 12) % 12)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-6 py-2 font-bold text-gray-800 min-w-[120px] text-center select-none">
              {MONTHS[selectedMonthIndex]}
            </div>
            <button 
              onClick={() => setSelectedMonthIndex((prev) => (prev + 1) % 12)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Widgets Superiores (Clima y Luna) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Widget Clima (Glassmorphism Like) */}
          <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Clima Actual • Zona Sur</p>
                <div className="flex items-baseline gap-2">
                   {loadingWeather ? (
                     <div className="h-10 w-20 bg-white/20 animate-pulse rounded"></div>
                   ) : (
                     <h2 className="text-5xl font-bold">{Math.round(weather?.current?.temperature_2m)}°</h2>
                   )}
                   <span className="text-xl opacity-80">Mayormente Soleado</span>
                </div>
              </div>
              <Cloud className="w-16 h-16 text-blue-100 opacity-80" />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                 <Droplets className="w-5 h-5 mb-1 opacity-80" />
                 <span className="text-sm font-semibold">{weather?.current?.relative_humidity_2m}%</span>
                 <span className="text-xs opacity-70">Humedad</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                 <Wind className="w-5 h-5 mb-1 opacity-80" />
                 <span className="text-sm font-semibold">12 km/h</span>
                 <span className="text-xs opacity-70">Viento</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                 <Thermometer className="w-5 h-5 mb-1 opacity-80" />
                 <span className="text-sm font-semibold">Max {Math.round(weather?.daily?.temperature_2m_max?.[0])}°</span>
                 <span className="text-xs opacity-70">Pronóstico</span>
              </div>
            </div>
          </div>

          {/* Widget Luna */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-4">Fase Lunar</p>
              <div className="flex items-center gap-4">
                <span className="text-5xl filter drop-shadow-md animate-pulse-slow">{moonPhase.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{moonPhase.name}</h3>
                  <p className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-full inline-block mt-1">
                    Ideal: {moonPhase.ideal}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
              Basado en cálculo astronómico para hoy
            </div>
          </div>
        </div>

        <TimelineAgricola/>

        {/* Sección Principal: Mis Actividades */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            Tus Actividades para {MONTHS[selectedMonthIndex]}
          </h2>

          {myActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myActivities.map((item, idx) => {
                // Determinar estado (Siembra vs Cosecha)
                let estado = "Mantenimiento";
                let badgeColor = "bg-gray-100 text-gray-600";
                
                if (item.type === 'agricultura') {
                  if (item.siembra?.includes(selectedMonthIndex + 1)) {
                    estado = "🌱 Época de Siembra";
                    badgeColor = "bg-green-100 text-green-700 border border-green-200";
                  } else if (item.cosecha?.includes(selectedMonthIndex + 1)) {
                    estado = "🌾 Época de Cosecha";
                    badgeColor = "bg-amber-100 text-amber-700 border border-amber-200";
                  }
                } else {
                  estado = item.actividad || "Cuidados Generales";
                  badgeColor = "bg-blue-50 text-blue-700 border border-blue-100";
                }

                return (
                  <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-3 rounded-xl ${item.color}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${badgeColor}`}>
                        {estado}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.type === 'agricultura' ? 'Revisa condiciones de humedad.' : 'Actividad veterinaria sugerida.'}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300">
              <Tractor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No hay actividades críticas programadas para tus cultivos este mes.</p>
              <p className="text-sm text-gray-400">Es un buen momento para mantenimiento de equipo o preparación de suelos.</p>
            </div>
          )}
        </div>

        {/* Sección Secundaria: Recomendaciones (Cross-selling / Discovery) */}
        {recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-white p-2 rounded-full shadow-sm">
                 <Info className="w-5 h-5 text-indigo-500" />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-indigo-900">¿Tienes espacio extra?</h3>
                 <p className="text-indigo-700 text-sm">Cultivos recomendados para iniciar en {MONTHS[selectedMonthIndex]}</p>
               </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white px-4 py-3 rounded-xl shadow-sm flex items-center gap-3 border border-indigo-100 hover:scale-105 transition-transform cursor-pointer">
                  <div className={`p-1.5 rounded-full ${rec.color.split(' ')[0]}`}>
                    <rec.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{rec.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Siembra</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}