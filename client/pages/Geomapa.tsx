import { ChevronLeft, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";

interface Resource {
  id: string;
  name: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
}

const resources: Resource[] = [
  {
    id: "1",
    name: "Centro de Acopio Norte",
    type: "Centros de Acopio",
    location: "Chetumal, Q. Roo",
    lat: 18.5,
    lng: -88.3,
  },
  {
    id: "2",
    name: "Infraestructura de Riego",
    type: "Infraestructura",
    location: "Felipe Carrillo Puerto, Q. Roo",
    lat: 19.6,
    lng: -87.75,
  },
  {
    id: "3",
    name: "Centro de Capacitación",
    type: "Centros de Acopio",
    location: "Bacalar, Q. Roo",
    lat: 18.65,
    lng: -88.4,
  },
];

const resourceTypes = [
  { id: "all", label: "Todos los Recursos", color: "bg-gray-600" },
  { id: "storage", label: "Centros de Acopio", color: "bg-green-600" },
  { id: "infrastructure", label: "Infraestructura", color: "bg-cyan-500" },
  { id: "courses", label: "Cursos", color: "bg-blue-600" },
];

export default function Geomapa() {
  const navigate = useNavigate();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    "Centros de Acopio",
  ]);

  const toggleFilter = (type: string) => {
    if (selectedFilters.includes(type)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== type));
    } else {
      setSelectedFilters([...selectedFilters, type]);
    }
  };

  const filteredResources =
    selectedFilters.length === 0
      ? resources
      : resources.filter((r) => selectedFilters.includes(r.type));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 flex flex-col">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </button>
          <button className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Geomapa de Recursos
          </h1>
        </div>

        {/* Map Area */}
        <div className="bg-green-50 rounded-lg border-2 border-green-200 h-64 md:h-96 mb-8 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">
                📍
              </div>
              <p className="text-gray-600 font-medium">Quintana Roo, México</p>
              <p className="text-sm text-gray-500 mt-2">
                Mapa interactivo de recursos disponibles
              </p>
            </div>
          </div>

          {/* Resource markers */}
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="absolute w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg hover:bg-green-600 hover:scale-110 cursor-pointer transition-all shadow-lg"
              style={{
                left: `${(resource.lng + 88.5) * 10}%`,
                top: `${(19.5 - resource.lat) * 10}%`,
              }}
              title={resource.name}
            >
              📍
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Filtros de Recursos</h2>
          <div className="flex flex-wrap gap-3">
            {resourceTypes.slice(1).map((type) => (
              <button
                key={type.id}
                onClick={() => toggleFilter(type.label)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedFilters.includes(type.label)
                    ? `${type.color} text-white`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Resource List */}
          <div className="mt-8">
            <h3 className="font-bold text-gray-900 mb-4">
              Recursos Encontrados
            </h3>
            {filteredResources.length > 0 ? (
              <div className="space-y-3">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {resource.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {resource.location}
                        </p>
                      </div>
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                        {resource.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay recursos disponibles con los filtros seleccionados
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
