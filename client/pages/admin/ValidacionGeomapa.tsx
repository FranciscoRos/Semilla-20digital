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

type ModalType = "revision" | "denegado" | null;

function SimpleModal({
  isOpen,
  title,
  onClose,
  children,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        {/* Contenido vacío por ahora, listo para que después agregues lo que necesites */}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export default function ValidacionGeomapa() {
  const navigate = useNavigate();

  // Zona seleccionada
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Estatus visual por zona (1 = En revisión, 2 = Aprobado, 3 = Denegado)
  const [zoneStatuses, setZoneStatuses] = useState<
    Record<string, number | null>
  >({});

  // Estado del modal
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalZoneId, setModalZoneId] = useState<string | null>(null);

  const handleSelectZone = (id: string) => {
    setSelectedZoneId(id);
  };

  const handleStatusChange = (id: string, status: number) => {
    setZoneStatuses((prev) => ({
      ...prev,
      [id]: status,
    }));

    console.log(`Zona ${id} marcada con estado ${status}`);

    // Abrir modal según el botón
    if (status === 1) {
      // En revisión
      setModalType("revision");
      setModalZoneId(id);
    } else if (status === 3) {
      // Denegado
      setModalType("denegado");
      setModalZoneId(id);
    } else {
      // Aprobado: sin modal
      setModalType(null);
      setModalZoneId(null);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setModalZoneId(null);
  };

  const getStatusLabel = (status: number | null | undefined) => {
    if (status === 1) return "En revisión";
    if (status === 2) return "Aprobado";
    if (status === 3) return "Denegado";
    return null;
  };

  const currentModalZone = zones.find((z) => z.id === modalZoneId);

  return (
    <div>
      {/* Header */}
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

      {/* Panel inferior: lista de zonas con botones de estatus */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Zonas marcadas</h2>

        {zones.length > 0 ? (
          <div className="space-y-3">
            {zones.map((zone) => {
              const currentStatus = zoneStatuses[zone.id] ?? null;
              const isSelected = selectedZoneId === zone.id;
              const statusLabel = getStatusLabel(currentStatus);

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
                    <p className="text-sm text-gray-600 mt-1">
                      {zone.location}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Lat: {zone.lat} · Lng: {zone.lng}
                    </p>
                   
                  </div>

                  {/*acciones*/}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(zone.id, 1); // revision
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border transition
                        ${
                          currentStatus === 1
                            ? "bg-yellow-500 text-white border-yellow-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      En revisión
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(zone.id, 2); // Aprobado
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border transition
                        ${
                          currentStatus === 2
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      Aprobado
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(zone.id, 3); // denegao
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border transition
                        ${
                          currentStatus === 3
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      Denegado
                    </button>
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

      {/* Modal En revisión */}
      {/* Modal En revisión */}
<SimpleModal
  isOpen={modalType === "revision"}
  title={
    currentModalZone
      ? `Revisión de : ${currentModalZone.name}`
      : "Revisión de zona"
  }
  onClose={closeModal}
>
  <div className="space-y-4">
    {/* Persona encargada */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Personal asigando</label>
        <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>

    </div>
  
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Fecha de revisión
      </label>
      <input
        type="date"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Hora de revisión
      </label>
      <input
        type="time"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
    </div>

    <button
      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-4"
    >
      Guardar revisión
    </button>
  </div>
</SimpleModal>


      {/* Modal Denegado */}
      <SimpleModal
        isOpen={modalType === "denegado"}
        title={
          currentModalZone
            ? `Denegar zona: ${currentModalZone.name}`
            : "Denegar zona"
        }
        onClose={closeModal}
      >


        <div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo del rechazo
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={4}
                placeholder="Por este medio...."
              />
            </div>
            <div>
                <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-4"
                > 
                Enviar
              
                </button>



            </div>

        </div>

      </SimpleModal>
    </div>
  );
}
