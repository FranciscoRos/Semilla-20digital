import { useState } from "react";
import { ChevronLeft, Settings2, MapPin } from "lucide-react";
import Header from "@/components/Header";
import { demoGeomapa } from "@/services/api";

const capas = [
  { id: "cultivos", label: "Cultivos", color: "bg-green-600" },
  { id: "recursos", label: "Recursos Naturales", color: "bg-blue-600" },
  { id: "pois", label: "Puntos de Interés", color: "bg-yellow-600" },
  { id: "alertas", label: "Alertas Comunitarias", color: "bg-red-600" },
  { id: "riesgos", label: "Zonas de Riesgo", color: "bg-orange-600" },
  {
    id: "infraestructura",
    label: "Infraestructura Gubernamental",
    color: "bg-purple-600",
  },
];

export default function Geomapa() {
  const [activeLayers, setActiveLayers] = useState(["cultivos", "pois"]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId],
    );
  };

  const filteredRecursos = demoGeomapa.filter((r) =>
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </button>
          <button className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Geomapa de Recursos
        </h1>

        {/* Mapa */}
        <div className="bg-green-50 rounded-lg border-2 border-green-200 h-64 md:h-96 mb-8 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Quintana Roo, México</p>
              <p className="text-sm text-gray-500 mt-2">
                Mapa interactivo de recursos disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Capas */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="font-bold text-gray-900 mb-4">Capas de Datos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {capas.map((capa) => (
              <button
                key={capa.id}
                onClick={() => toggleLayer(capa.id)}
                className={`p-3 rounded-lg border-2 transition text-left ${
                  activeLayers.includes(capa.id)
                    ? `${capa.color} text-white border-transparent`
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-sm font-medium">{capa.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Búsqueda y Recursos */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-4">Recursos Disponibles</h2>

          <input
            type="text"
            placeholder="Buscar recurso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <div className="space-y-3">
            {filteredRecursos.map((recurso) => (
              <div
                key={recurso.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {recurso.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Tipo: {recurso.tipo}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Coordenadas: {recurso.latitud}, {recurso.longitud}
                    </p>
                  </div>
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                    {recurso.tipo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
