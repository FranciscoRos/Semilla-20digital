import { ChevronLeft, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Zone {
  id: string;
  name: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
}

const zones: Zone[] = [
  {
    id: "1",
    name: "Zona Norte",
    type: "Centro de Acopio",
    location: "Chetumal, Q. Roo",
    lat: 18.5,
    lng: -88.3,
  },
  {
    id: "2",
    name: "Zona de Riego",
    type: "Infraestructura",
    location: "Felipe Carrillo Puerto, Q. Roo",
    lat: 19.6,
    lng: -87.75,
  },
  {
    id: "3",
    name: "Zona de Capacitación",
    type: "Centro de Capacitación",
    location: "Bacalar, Q. Roo",
    lat: 18.65,
    lng: -88.4,
  },
];

export default function ValidacionGeomapa() {
  const navigate = useNavigate();

  // Estado para saber qué zona está seleccionada en el mapa/lista
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Estado para guardar el "estatus" 1,2,3 de cada zona (por ahora solo visual)
  const [zoneStatuses, setZoneStatuses] = useState<Record<string, number | null>>({});

  const handleSelectZone = (id: string) => {
    setSelectedZoneId(id);
  };

  const handleStatusChange = (id: string, status: number) => {
    setZoneStatuses((prev) => ({
      ...prev,
      [id]: status,
    }));
    // Aquí después puedes hacer llamado a API para validar/rechazar/etc.
    console.log(`Zona ${id} marcadada con estado ${status}`);
  };

  return (
    <div>
      {/* Header con botón de volver y ajustes */}
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
          Geomapa – Administración de Zonas
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Revisa y valida las zonas marcadas en el territorio.
        </p>
      </div>

      {/* Área del mapa */}
      <div className="bg-green-50 rounded-lg border-2 border-green-200 h-64 md:h-96 mb-8 flex items-center justify-center relative overflow-hidden">
        {/* Fondo / texto central */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">
              🗺️
            </div>
            <p className="text-gray-600 font-medium">Quintana Roo, México</p>
            <p className="text-sm text-gray-500 mt-2">
              Vista administrativa de zonas marcadas
            </p>
          </div>
        </div>

        {/* Marcadores de zonas */}
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => handleSelectZone(zone.id)}
            className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-white text-lg cursor-pointer transition-all shadow-lg
              ${
                selectedZoneId === zone.id
                  ? "bg-green-700 ring-2 ring-white scale-110"
                  : "bg-green-500 hover:bg-green-600 hover:scale-110"
              }`}
            style={{
              left: `${(zone.lng + 88.5) * 10}%`,
              top: `${(19.5 - zone.lat) * 10}%`,
            }}
            title={zone.name}
          >
            📍
          </button>
        ))}
      </div>

      {/* Panel inferior: lista de zonas con botones 1,2,3 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Zonas marcadas</h2>
     

        {zones.length > 0 ? (
          <div className="space-y-3">
            {zones.map((zone) => {
              const currentStatus = zoneStatuses[zone.id] ?? null;
              const isSelected = selectedZoneId === zone.id;

              return (
                <div
                  key={zone.id}
                  onClick={() => handleSelectZone(zone.id)}
                  className={`p-4 border rounded-lg transition cursor-pointer flex items-start justify-between gap-4
                    ${
                      isSelected
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {zone.name}
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        {zone.type}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{zone.location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Lat: {zone.lat} · Lng: {zone.lng}
                    </p>
                    {currentStatus && (
                      <p className="text-xs text-green-700 mt-2">
                      </p>
                    )}
                  </div>

                  {/* Botones 1, 2, 3 */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // para que no dispare el onClick del contenedor
                          handleStatusChange(zone.id, status);
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition
                          ${
                            currentStatus === status
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No hay zonas registradas actualmente.
          </p>
        )}
      </div>
    </div>
  );
}
