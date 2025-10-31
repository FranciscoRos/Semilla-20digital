import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Droplets,
  Bug,
  Moon,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Sprout,
  Calendar,
  AlertCircle,
} from "lucide-react";

// Configuración de cultivos por región (Quintana Roo, México)
// IMPORTANTE: Personalizar según tu región específica
const CROP_CALENDAR = {
  "Maíz": {
    siembra: [4, 5, 6], // Abril-Junio (temporada de lluvias)
    cosecha: [9, 10, 11],
    ciclo: 120, // días
    color: "yellow",
  },
  "Frijol": {
    siembra: [5, 6, 7],
    cosecha: [8, 9, 10],
    ciclo: 90,
    color: "amber",
  },
  "Chile Habanero": {
    siembra: [3, 4, 5],
    cosecha: [7, 8, 9, 10],
    ciclo: 90,
    color: "red",
  },
  "Tomate": {
    siembra: [9, 10, 11],
    cosecha: [12, 1, 2],
    ciclo: 75,
    color: "rose",
  },
  "Calabaza": {
    siembra: [4, 5, 6],
    cosecha: [7, 8, 9],
    ciclo: 90,
    color: "orange",
  },
  "Papaya": {
    siembra: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Todo el año
    cosecha: [], // Cosecha continua después de 9 meses
    ciclo: 270,
    color: "lime",
  },
};

// Temporadas climáticas para Quintana Roo
const SEASONS = {
  1: { name: "Seca-Fría", rain: "Baja", temp: "Templado" },
  2: { name: "Seca-Fría", rain: "Baja", temp: "Templado" },
  3: { name: "Seca-Caliente", rain: "Baja", temp: "Calor" },
  4: { name: "Seca-Caliente", rain: "Media", temp: "Calor" },
  5: { name: "Lluviosa", rain: "Alta", temp: "Calor" },
  6: { name: "Lluviosa", rain: "Muy Alta", temp: "Calor" },
  7: { name: "Lluviosa", rain: "Muy Alta", temp: "Calor" },
  8: { name: "Lluviosa", rain: "Alta", temp: "Calor" },
  9: { name: "Lluviosa", rain: "Alta", temp: "Calor" },
  10: { name: "Lluviosa", rain: "Media", temp: "Templado" },
  11: { name: "Transición", rain: "Media", temp: "Templado" },
  12: { name: "Seca-Fría", rain: "Baja", temp: "Templado" },
};

// Función para calcular fase lunar
function getMoonPhase(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();
  
  let c = 0, e = 0, jd = 0, b = 0;
  let y = year;
  
  if (month < 3) {
    y--;
    month += 12;
  }
  
  ++month;
  c = 365.25 * y;
  e = 30.6 * month;
  jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  b = parseInt(jd);
  jd -= b;
  b = Math.round(jd * 8);
  
  if (b >= 8) b = 0;
  
  const phases = [
    { name: "Luna Nueva", icon: "🌑", ideal: "Descanso del suelo" },
    { name: "Creciente", icon: "🌒", ideal: "Siembra de frutos" },
    { name: "Cuarto Creciente", icon: "🌓", ideal: "Siembra de hortalizas" },
    { name: "Creciente Gibosa", icon: "🌔", ideal: "Siembra de cereales" },
    { name: "Luna Llena", icon: "🌕", ideal: "Cosecha óptima" },
    { name: "Menguante Gibosa", icon: "🌖", ideal: "Control de plagas" },
    { name: "Cuarto Menguante", icon: "🌗", ideal: "Poda y fertilización" },
    { name: "Menguante", icon: "🌘", ideal: "Preparación de tierra" },
  ];
  
  return phases[b];
}

// Meses en español
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function CalendarioAgricola() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeLayers, setActiveLayers] = useState(["weather", "crops", "moon", "season"]);
  const [selectedCrop, setSelectedCrop] = useState("Todos");
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);

  // Ubicación: Cancún, Quintana Roo
  const LOCATION = { lat: 21.1619, lon: -86.8515 };

  useEffect(() => {
    // Cargar datos de demostración al inicio
    loadDemoWeather();
  }, []);

  const loadDemoWeather = () => {
    setWeatherData({
      current: {
        temp: 28,
        humidity: 75,
        description: "Parcialmente nublado",
        wind: 15,
      },
      forecast: [
        { day: "Hoy", temp: 28, rain: 20, icon: "☀️" },
        { day: "Mañana", temp: 29, rain: 30, icon: "⛅" },
        { day: "Día 3", temp: 27, rain: 60, icon: "🌧️" },
        { day: "Día 4", temp: 26, rain: 40, icon: "🌦️" },
        { day: "Día 5", temp: 28, rain: 10, icon: "☀️" },
      ]
    });
  };

  const fetchWeatherData = async () => {
    if (!apiKey || apiKey.trim() === "") {
      setError("Por favor ingresa tu API Key de OpenWeatherMap");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Datos actuales
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LOCATION.lat}&lon=${LOCATION.lon}&units=metric&lang=es&appid=${apiKey}`
      );
      
      // Pronóstico 5 días
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${LOCATION.lat}&lon=${LOCATION.lon}&units=metric&lang=es&appid=${apiKey}`
      );

      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error("Error al obtener datos. Verifica tu API Key.");
      }

      const current = await currentRes.json();
      const forecast = await forecastRes.json();

      // Procesar pronóstico (tomar un dato por día)
      const dailyForecast = [];
      const seenDays = new Set();
      
      forecast.list.forEach((item) => {
        const day = new Date(item.dt * 1000).toLocaleDateString('es', { weekday: 'short' });
        if (!seenDays.has(day) && dailyForecast.length < 5) {
          seenDays.add(day);
          const iconMap = {
            '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
          };
          dailyForecast.push({
            day: day,
            temp: Math.round(item.main.temp),
            rain: Math.round(item.pop * 100),
            icon: iconMap[item.weather[0].icon] || '☁️',
          });
        }
      });

      setWeatherData({
        current: {
          temp: Math.round(current.main.temp),
          humidity: current.main.humidity,
          description: current.weather[0].description,
          wind: Math.round(current.wind.speed * 3.6),
        },
        forecast: dailyForecast,
      });
      
      setShowApiInput(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLayer = (layerId) => {
    setActiveLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId]
    );
  };

  // Obtener cultivos para el mes seleccionado
  const getCropsForMonth = () => {
    const month = selectedMonth + 1;
    const siembra = [];
    const cosecha = [];

    Object.entries(CROP_CALENDAR).forEach(([crop, data]) => {
      if (selectedCrop !== "Todos" && crop !== selectedCrop) return;
      
      if (data.siembra.includes(month)) siembra.push(crop);
      if (data.cosecha.includes(month)) cosecha.push(crop);
    });

    return { siembra, cosecha };
  };

  const currentDate = new Date();
  currentDate.setMonth(selectedMonth);
  const moonPhase = getMoonPhase(currentDate);
  const season = SEASONS[selectedMonth + 1];
  const { siembra, cosecha } = getCropsForMonth();

  const layers = [
    { id: "weather", label: "Clima", icon: Cloud },
    { id: "season", label: "Temporada", icon: Sun },
    { id: "crops", label: "Cultivos", icon: Sprout },
    { id: "moon", label: "Luna", icon: Moon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌾 Calendario Agrícola
          </h1>
          <p className="text-gray-600">
            Planificación inteligente para Quintana Roo, México
          </p>
        </div>

        {/* Filtros y Capas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Información Mostrada
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`p-4 rounded-lg border-2 transition ${
                  activeLayers.includes(layer.id)
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <layer.icon className={`w-6 h-6 mx-auto mb-2 ${
                  activeLayers.includes(layer.id) ? "text-green-600" : "text-gray-500"
                }`} />
                <span className="text-sm font-medium text-gray-700">
                  {layer.label}
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filtrar por Cultivo
            </label>
            <div className="flex gap-2 flex-wrap">
              {["Todos", ...Object.keys(CROP_CALENDAR)].map((crop) => (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    selectedCrop === crop
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navegación del Mes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedMonth((p) => (p - 1 + 12) % 12)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900">
              {MONTHS[selectedMonth]} 2025
            </h2>
            
            <button
              onClick={() => setSelectedMonth((p) => (p + 1) % 12)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Pronóstico del Clima (5 días) */}
          {activeLayers.includes("weather") && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Pronóstico a 5 Días
                </h3>
                {/* {!showApiInput && (
                  <button
                    onClick={() => setShowApiInput(true)}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Conectar API Real
                  </button>
                )} */}
              </div>
              
              {showApiInput && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key de OpenWeatherMap
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Ingresa tu API key aquí..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={fetchWeatherData}
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading ? "Cargando..." : "Conectar"}
                    </button>
                    <button
                      onClick={() => setShowApiInput(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Obtén tu API key gratuita en{" "}
                    <a 
                      href="https://openweathermap.org/api" 
                      target="_blank" 
                      className="text-blue-600 underline"
                    >
                      openweathermap.org
                    </a>
                  </p>
                  {error && (
                    <div className="mt-3 bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-800">
                      {error}
                    </div>
                  )}
                </div>
              )}

             {/*  {!showApiInput && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Mostrando datos de demostración.</strong> Conecta tu API para obtener pronósticos reales.
                  </div>
                </div>
              )} */}

              {weatherData && (
                <>
                  {/* Clima Actual */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-700 mb-2">Condiciones Actuales</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Thermometer className="w-5 h-5 text-blue-600 mb-1" />
                        <p className="text-2xl font-bold text-blue-900">
                          {weatherData.current.temp}°C
                        </p>
                        <p className="text-xs text-blue-700">Temperatura</p>
                      </div>
                      <div>
                        <Droplets className="w-5 h-5 text-blue-600 mb-1" />
                        <p className="text-2xl font-bold text-blue-900">
                          {weatherData.current.humidity}%
                        </p>
                        <p className="text-xs text-blue-700">Humedad</p>
                      </div>
                      <div>
                        <Wind className="w-5 h-5 text-blue-600 mb-1" />
                        <p className="text-2xl font-bold text-blue-900">
                          {weatherData.current.wind} km/h
                        </p>
                        <p className="text-xs text-blue-700">Viento</p>
                      </div>
                      <div>
                        <Cloud className="w-5 h-5 text-blue-600 mb-1" />
                        <p className="text-sm font-bold text-blue-900 capitalize">
                          {weatherData.current.description}
                        </p>
                        <p className="text-xs text-blue-700">Condición</p>
                      </div>
                    </div>
                  </div>

                  {/* Pronóstico */}
                  <div className="grid grid-cols-5 gap-2">
                    {weatherData.forecast.map((day, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 text-center">
                        <p className="text-xs font-medium text-blue-900 mb-2 capitalize">{day.day}</p>
                        <p className="text-2xl mb-1">{day.icon}</p>
                        <p className="text-lg font-bold text-blue-900">{day.temp}°C</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <CloudRain className="w-3 h-3 text-blue-600" />
                          <p className="text-xs text-blue-700">{day.rain}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Temporada Climática */}
          {activeLayers.includes("season") && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Temporada Climática
              </h3>
              <div className="bg-white rounded-lg p-4">
                <p className="text-2xl font-bold text-orange-900 mb-2">{season.name}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-orange-700">Precipitación</p>
                    <p className="text-lg font-bold text-orange-900">{season.rain}</p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-700">Temperatura</p>
                    <p className="text-lg font-bold text-orange-900">{season.temp}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ciclo Lunar */}
          {activeLayers.includes("moon") && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 border border-purple-200">
              <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Ciclo Lunar
              </h3>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-4xl">{moonPhase.icon}</span>
                  <div>
                    <p className="text-xl font-bold text-purple-900">{moonPhase.name}</p>
                    <p className="text-sm text-purple-700">{moonPhase.ideal}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cultivos del Mes */}
          {activeLayers.includes("crops") && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
              <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                <Sprout className="w-5 h-5" />
                Cultivos de {MONTHS[selectedMonth]}
              </h3>
              
              {siembra.length > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="font-semibold text-green-900 mb-3">🌱 Época de Siembra</p>
                  <div className="flex flex-wrap gap-2">
                    {siembra.map((crop) => (
                      <span
                        key={crop}
                        className="bg-green-200 text-green-900 px-4 py-2 rounded-full font-medium text-sm"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cosecha.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-3">🌾 Época de Cosecha</p>
                  <div className="flex flex-wrap gap-2">
                    {cosecha.map((crop) => (
                      <span
                        key={crop}
                        className="bg-amber-200 text-amber-900 px-4 py-2 rounded-full font-medium text-sm"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {siembra.length === 0 && cosecha.length === 0 && (
                <div className="bg-white rounded-lg p-4 text-center text-gray-600">
                  No hay actividades principales este mes para los cultivos seleccionados
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con Información 
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-3">📋 Guía de Implementación:</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Calendario de Cultivos:</strong> Basado en condiciones típicas de Quintana Roo. Modifica el objeto CROP_CALENDAR para tus cultivos.</li>
            <li>• <strong>API del Clima:</strong> Obtén tu key gratuita en <a href="https://openweathermap.org/api" target="_blank" className="underline">OpenWeatherMap</a> (1000 llamadas/día gratis).</li>
            <li>• <strong>Ciclos Lunares:</strong> Calculados automáticamente usando algoritmo astronómico preciso.</li>
            <li>• <strong>Backend Laravel:</strong> Crea el endpoint GET /api/calendario-agricola para servir los datos de cultivos desde tu base de datos.</li>
          </ul>
        </div>
        */}
      </div>
    </div>
  );
}