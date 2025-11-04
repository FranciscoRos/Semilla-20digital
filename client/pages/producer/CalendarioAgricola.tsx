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


  const LOCATION = { lat: 18.51836, lon: -88.30227 };

  useEffect(() => {
    // Cargar datos reales de Open-Meteo al inicio (sin API key necesaria)
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Open-Meteo API - Totalmente GRATIS, sin límites, sin API key
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${LOCATION.lat}&longitude=${LOCATION.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=America/Cancun&forecast_days=7`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Error al obtener datos del clima");
      }

      const data = await response.json();

      // Mapeo de códigos de clima a emojis y descripciones
      const getWeatherInfo = (code) => {
        const weatherCodes = {
          0: { icon: '☀️', desc: 'Despejado' },
          1: { icon: '🌤️', desc: 'Mayormente despejado' },
          2: { icon: '⛅', desc: 'Parcialmente nublado' },
          3: { icon: '☁️', desc: 'Nublado' },
          45: { icon: '🌫️', desc: 'Niebla' },
          48: { icon: '🌫️', desc: 'Niebla con escarcha' },
          51: { icon: '🌦️', desc: 'Llovizna ligera' },
          53: { icon: '🌦️', desc: 'Llovizna moderada' },
          55: { icon: '🌧️', desc: 'Llovizna intensa' },
          61: { icon: '🌧️', desc: 'Lluvia ligera' },
          63: { icon: '🌧️', desc: 'Lluvia moderada' },
          65: { icon: '⛈️', desc: 'Lluvia intensa' },
          71: { icon: '🌨️', desc: 'Nevada ligera' },
          73: { icon: '🌨️', desc: 'Nevada moderada' },
          75: { icon: '❄️', desc: 'Nevada intensa' },
          77: { icon: '🌨️', desc: 'Granizo' },
          80: { icon: '🌦️', desc: 'Chubascos ligeros' },
          81: { icon: '⛈️', desc: 'Chubascos moderados' },
          82: { icon: '⛈️', desc: 'Chubascos violentos' },
          85: { icon: '🌨️', desc: 'Nevadas ligeras' },
          86: { icon: '❄️', desc: 'Nevadas intensas' },
          95: { icon: '⛈️', desc: 'Tormenta' },
          96: { icon: '⛈️', desc: 'Tormenta con granizo ligero' },
          99: { icon: '⛈️', desc: 'Tormenta con granizo intenso' },
        };
        return weatherCodes[code] || { icon: '☁️', desc: 'Variable' };
      };

      // Datos actuales
      const currentWeather = getWeatherInfo(data.current.weather_code);
      
      // Pronóstico 5 días
      const dailyForecast = [];
      const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      
      for (let i = 0; i < 5; i++) {
        const date = new Date(data.daily.time[i]);
        const dayName = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : daysOfWeek[date.getDay()];
        const weather = getWeatherInfo(data.daily.weather_code[i]);
        
        dailyForecast.push({
          day: dayName,
          date: data.daily.time[i],
          temp: Math.round((data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2),
          tempMax: Math.round(data.daily.temperature_2m_max[i]),
          tempMin: Math.round(data.daily.temperature_2m_min[i]),
          rain: Math.round(data.daily.precipitation_probability_max[i]),
          precipitation: data.daily.precipitation_sum[i],
          icon: weather.icon,
        });
      }

      setWeatherData({
        current: {
          temp: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          description: currentWeather.desc,
          wind: Math.round(data.current.wind_speed_10m),
        },
        forecast: dailyForecast,
      });
    } catch (err) {
      setError("No se pudo conectar al servicio de clima. Intenta más tarde.");
      console.error(err);
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
                <button
                  onClick={fetchWeatherData}
                  disabled={loading}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      🔄 Actualizar
                    </>
                  )}
                </button>
              </div>


              {error && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

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
                        <p className="text-xs font-medium text-blue-900 mb-1 capitalize">{day.day}</p>
                        <p className="text-xs text-gray-600 mb-2">{day.date}</p>
                        <p className="text-3xl mb-2">{day.icon}</p>
                        <p className="text-lg font-bold text-blue-900">{day.temp}°C</p>
                        <p className="text-xs text-gray-600">↑{day.tempMax}° ↓{day.tempMin}°</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <CloudRain className="w-3 h-3 text-blue-600" />
                          <p className="text-xs text-blue-700">{day.rain}%</p>
                        </div>
                        {day.precipitation > 0 && (
                          <p className="text-xs text-blue-600 mt-1">{day.precipitation.toFixed(1)}mm</p>
                        )}
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
            <li>• <strong>API del Clima:</strong> Usa <a href="https://open-meteo.com" target="_blank" className="underline font-semibold">Open-Meteo</a> - totalmente gratis, sin límites, sin API key necesaria.</li>
            <li>• <strong>Ciclos Lunares:</strong> Calculados automáticamente usando algoritmo astronómico preciso.</li>
            <li>• <strong>Backend Laravel:</strong> Opcional - para personalizar por usuario y agregar funciones como historial de siembras, alertas personalizadas, etc.</li>
            <li>• <strong>Datos Locales:</strong> Consulta INIFAP México o extensionistas agrícolas de Quintana Roo para calendarios más precisos.</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}