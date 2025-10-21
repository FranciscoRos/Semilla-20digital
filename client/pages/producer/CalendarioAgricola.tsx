import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Droplets,
  Bug,
  Moon,
} from "lucide-react";
import Header from "@/components/Header";

// DATOS DEMO - Reemplazar con API de Laravel en: GET /api/calendario-agricola
const calendarData = [
  {
    id: 1,
    month: "Enero",
    weather: { temp: "28°C", humidity: "65%", rain: "45mm" },
    crops: ["Maíz", "Frijol"],
    plagues: "Bajo",
    moonPhase: "Creciente",
  },
  {
    id: 2,
    month: "Febrero",
    weather: { temp: "29°C", humidity: "60%", rain: "35mm" },
    crops: ["Tomate", "Chile"],
    plagues: "Medio",
    moonPhase: "Llena",
  },
];

const layers = [
  { id: "weather", label: "Pronóstico del Tiempo", icon: Cloud },
  { id: "water", label: "Recursos Hídricos", icon: Droplets },
  { id: "plagues", label: "Control de Plagas", icon: Bug },
  { id: "moon", label: "Ciclos Lunares", icon: Moon },
];

const crops = ["Todos", "Maíz", "Frijol", "Tomate", "Chile", "Ganadería"];

export default function CalendarioAgricola() {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [activeLayers, setActiveLayers] = useState(["weather", "crops"]);
  const [selectedCrop, setSelectedCrop] = useState("Todos");

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Calendario Agrícola
        </h1>
        <p className="text-gray-600 mb-8">
          Información crucial para planificar tus actividades agrícolas
        </p>

        {/* Filtros */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="font-bold text-gray-900 mb-4">Filtros</h2>

          {/* Capas de Datos */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Capas de Información
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`p-3 rounded-lg border-2 transition ${
                    activeLayers.includes(layer.id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <layer.icon className="w-5 h-5 mx-auto mb-2 text-gray-700" />
                  <span className="text-xs font-medium text-gray-700">
                    {layer.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de Cultivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filtrar por Actividad
            </label>
            <div className="flex gap-2 flex-wrap">
              {crops.map((crop) => (
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

        {/* Calendario */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {calendarData[selectedMonth]?.month || "Enero"} 2024
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMonth((p) => Math.max(0, p - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setSelectedMonth((p) =>
                    Math.min(calendarData.length - 1, p + 1),
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {calendarData[selectedMonth] && (
            <div className="space-y-6">
              {/* Clima */}
              {activeLayers.includes("weather") && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-3">
                    Pronóstico del Tiempo
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-blue-700">Temperatura</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {calendarData[selectedMonth].weather.temp}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Humedad</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {calendarData[selectedMonth].weather.humidity}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Precipitación</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {calendarData[selectedMonth].weather.rain}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cultivos */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-bold text-green-900 mb-3">
                  Cultivos Recomendados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {calendarData[selectedMonth].crops.map((crop) => (
                    <span
                      key={crop}
                      className="bg-green-200 text-green-800 px-4 py-2 rounded-full font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Plagas */}
              {activeLayers.includes("plagues") && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-bold text-orange-900 mb-3">
                    Riesgo de Plagas
                  </h3>
                  <p className="text-orange-800">
                    Nivel de incidencia:{" "}
                    <span className="font-bold">
                      {calendarData[selectedMonth].plagues}
                    </span>
                  </p>
                </div>
              )}

              {/* Luna */}
              {activeLayers.includes("moon") && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-bold text-purple-900 mb-3">
                    Ciclo Lunar
                  </h3>
                  <p className="text-purple-800">
                    Fase actual:{" "}
                    <span className="font-bold">
                      {calendarData[selectedMonth].moonPhase}
                    </span>
                  </p>
                  <p className="text-sm text-purple-700 mt-2">
                    Recomendación: Siembra en fase creciente para mejor
                    germinación
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
