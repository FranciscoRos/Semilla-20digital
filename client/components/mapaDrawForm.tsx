import { useState, useRef, useEffect, act } from "react";
import {
  Check,
  AlertCircle,
  MapPin,
  Trash2,
  Plus,
  Eye,
  Key,
} from "lucide-react";

import MapaDibujo from "./mapaDraw";
import { toast } from "@/hooks/use-toast";

interface Parcela {
  id: string | undefined;
  fechaRegistro: string;
  ciudad: string;
  municipio: string;
  localidad: string;
  direccionAdicional: string;
  coordenadas: { lat: number; lng: number }[];
  area: number;
  nombre: string;
  usos: {
    area: string;
    actividadesEspecificas: string[];
  }[];
}


const USOS_PARCELA = {
  agricultura: {
    label: "Agricultura",
    color: "Verde",
    icon: "🌾",
    actividades: [
      { value: "maiz", label: "Siembra de Maíz" },
      { value: "frijol", label: "Siembra de Frijol" },
      { value: "chile", label: "Siembra de Chile" },
      { value: "tomate", label: "Siembra de Tomate" },
      { value: "calabaza", label: "Siembra de Calabaza" },
      { value: "hortalizas", label: "Cultivo de Hortalizas" },
      { value: "frutas", label: "Cultivo de Frutas" },
    ],
  },
  ganaderia: {
    label: "Ganadería",
    color: "Cafe",
    icon: "🐄",
    actividades: [
      { value: "vacas", label: "Cría de Vacas" },
      { value: "cerdos", label: "Cría de Cerdos" },
      { value: "ovejas", label: "Cría de Ovejas" },
      { value: "cabras", label: "Cría de Cabras" },
      { value: "pollos", label: "Cría de Pollos" },
      { value: "caballos", label: "Cría de Caballos" },
    ],
  },
  pesca: {
    label: "Pesca/Acuacultura",
    color: "Azul",
    icon: "🐟",
    actividades: [
      { value: "mojarra", label: "Cría de Mojarra" },
      { value: "tilapia", label: "Cría de Tilapia" },
      { value: "camaron", label: "Cría de Camarón" },
      { value: "trucha", label: "Cría de Trucha" },
      { value: "carpa", label: "Cría de Carpa" },
      { value: "bagre", label: "Cría de Bagre" },
    ],
  },
  apicultura: {
    label: "Apicultura",
    icon: "🐝",
    actividades: [
      { value: "produccion_miel", label: "Producción de Miel" },
      { value: "cria_reinas", label: "Cría de Abejas Reina" },
      { value: "meliponicultura", label: "Meliponicultura (Abeja nativa)" },
      { value: "subproductos", label: "Cera, Propóleo y Jalea Real" },
    ],
},
};

// Componente principal: Registro de Parcelas
export default function RegistroParcelas({onParcelasChange,initialParcelas=[]}) {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [vistaActual, setVistaActual] = useState("registro"); 
  useEffect(()=>{
    if(initialParcelas && initialParcelas.length>0){
      setParcelas(initialParcelas);
    }
  },[initialParcelas])

  const getEnvApiKey = () => {
    let envKey = "";
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
            // @ts-ignore
            envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        }
        else if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
            envKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        }
    } catch (e) { console.log("No env key detected"); }

    return envKey;

  };


  const [apiKey] = useState(getEnvApiKey()); 

  // Datos de la parcela actual
  const [parcelaActual, setParcelaActual] = useState<Parcela>({
    id: undefined,
    fechaRegistro: "",
    ciudad: "",
    municipio: "",
    localidad: "",
    direccionAdicional: "",
    coordenadas: [],
    area: 0,
    nombre: "",
    usos: [
      {
        area: "",
        actividadesEspecificas: [],
      },
    ],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
  onParcelasChange(parcelas); 
}, [parcelas]);
  // Manejar cambios en el polígono del mapa
  const handlePolygonChange = ({ coordinates, area }) => {
    setParcelaActual((prev) => ({
      ...prev,
      coordenadas: coordinates,
      area: parseFloat(area),
    }));
    if (coordinates.length >= 3) {
      setErrors((prev) => ({ ...prev, coordenadas: null }));
    }
  };



  // Validar y guardar parcela
  const handleGuardarParcela = () => {
    const newErrors = {};

    // Validaciones
    if (!parcelaActual.ciudad.trim()) {
      newErrors["ciudad"] = "La ciudad es obligatoria";
    }
    if (!parcelaActual.municipio.trim()) {
      newErrors["municipio"] = "El municipio es obligatorio";
    }
    if (!parcelaActual.localidad.trim()) {
      newErrors["localidad"] = "La localidad es obligatoria";
    }
    if (parcelaActual.coordenadas.length < 3) {
      newErrors["coordenadas"] = "Debes dibujar el polígono de la parcela";
    }
    if (!parcelaActual.direccionAdicional.trim()) {
      newErrors["direccionAdicional"] = "Debe proporcionar una direccion adicional";
    }
    if (parcelaActual.usos.length === 0) {
      newErrors["usos"] = "Selecciona minimo un área de uso";
    } else {
      parcelaActual.usos.map((pA) => {
        if (pA.actividadesEspecificas.length === 0) {
          newErrors[`actEsp${pA.area}`] = "Selecciona al menos una actividad";
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return console.error(newErrors);
    }

    // Crear objeto de parcela con estructura definida
    if (parcelaActual.id === undefined) {
      const nuevaParcela = {
        id: Date.now().toString(),
        ciudad: parcelaActual.ciudad,
        municipio: parcelaActual.municipio,
        localidad: parcelaActual.localidad,
        direccionAdicional: parcelaActual.direccionAdicional,
        coordenadas: parcelaActual.coordenadas,
        area: parcelaActual.area,
        nombre: parcelaActual.nombre
          ? parcelaActual.nombre
          : `Parcela ${parcelas.length + 1}-${parcelaActual.usos[0].area}-${parcelaActual.localidad}`,
        usos: parcelaActual.usos.map((uso) => ({
          area: uso.area,
          actividadesEspecificas: uso.actividadesEspecificas,
        })),
        fechaRegistro: new Date().toISOString(),
      };

      // Agregar a la lista de parcelas
      setParcelas((prev) => [...prev, nuevaParcela]);

      // Aquí guardarías en tu base de datos
      console.log("Nueva parcela guardada:", nuevaParcela);
      console.log("Arreglo completo de parcelas:", [...parcelas, nuevaParcela]);
    } else {
      setParcelas((prev) =>
        prev.map((p) =>
          p.id === parcelaActual.id
            ? {
                id: parcelaActual.id,
                ciudad: parcelaActual.ciudad,
                municipio: parcelaActual.municipio,
                localidad: parcelaActual.localidad,
                direccionAdicional: parcelaActual.direccionAdicional,
                coordenadas: parcelaActual.coordenadas,
                area: parcelaActual.area,
                nombre: parcelaActual.nombre
                  ? parcelaActual.nombre
                : `Parcela ${parcelas.length + 1}-${parcelaActual.usos[0].area}-${parcelaActual.localidad}`,
                usos: parcelaActual.usos.map((uso) => ({
                  area: uso.area,
                  actividadesEspecificas: uso.actividadesEspecificas,
                })),
        fechaRegistro: new Date().toISOString(),
              }
            : p,
        ),
      );

      // Aquí guardarías en tu base de datos
      console.log("Parcela Actualizada Correctamente");
      console.log("Arreglo completo de parcelas:", parcelas);
    }

    handleLimpiar();
    toast({
        title: parcelaActual.id
        ? "Parcela actualizada exitosamente"
        : "Parcela registrada exitosamente",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-900",
      })

  };

  // Limpiar formulario
  const handleLimpiar = () => {
    setParcelaActual({
      id: undefined,
      fechaRegistro: "",
      ciudad: "",
      municipio: "",
      localidad: "",
      direccionAdicional: "",
      coordenadas: [],
      area: 0,
      nombre: "",
      usos: [{ area: "", actividadesEspecificas: [] }],
    });
    setErrors({});
  };

  // Renderizar vista de registro
  const renderRegistro = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {parcelaActual.id ? "Editar Parcela" : "Registro de Nueva Parcela"}
        </h2>
        <p className="text-gray-600">
          {parcelaActual.id
            ? `Modificando: ${parcelaActual.nombre}`
            : "Completa todos los campos y dibuja el polígono en el mapa"}
        </p>
      </div>

      {/* Ubicación */}
      <div className="border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
          📍 Ubicación
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ciudad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={parcelaActual.ciudad}
              onChange={(e) => {
                setParcelaActual((prev) => ({
                  ...prev,
                  ciudad: e.target.value,
                }));
                setErrors((prev) => ({ ...prev, ciudad: null }));
              }}
              placeholder="Ej: Cancún"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors["ciudad"] ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors["ciudad"] && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors["ciudad"]}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Municipio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={parcelaActual.municipio}
              onChange={(e) => {
                setParcelaActual((prev) => ({
                  ...prev,
                  municipio: e.target.value,
                }));
                setErrors((prev) => ({ ...prev, municipio: null }));
              }}
              placeholder="Ej: Benito Juárez"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors["municipio"] ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors["municipio"] && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors["municipio"]}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Localidad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={parcelaActual.localidad}
              onChange={(e) => {
                setParcelaActual((prev) => ({
                  ...prev,
                  localidad: e.target.value,
                }));
                setErrors((prev) => ({ ...prev, localidad: null }));
              }}
              placeholder="Ej: Región 100"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors["localidad"] ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors["localidad"] && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors["localidad"]}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dirección o Datos Adicionales
            </label>
            <input
              type="text"
              value={parcelaActual.direccionAdicional}
              onChange={(e) =>
                setParcelaActual((prev) => ({
                  ...prev,
                  direccionAdicional: e.target.value,
                }))
              }
              placeholder="Ej: A 2km de la carretera principal"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            />
          </div>
          {/* Nombre del Sector */}
          <div className="mb-6 col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del Sector
            </label>
            <input
              type="text"
              value={parcelaActual.nombre}
              onChange={(e) => {
                setParcelaActual((prev) => ({
                  ...prev,
                  nombre: e.target.value,
                }));
                setErrors((prev) => ({ ...prev, nombreSector: null }));
              }}
              placeholder="Ej: Zona de Maíz Norte, Área de Ganado Sur, Estanque Este"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            />
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
          🗺️ Delimitar Parcela
        </h3>

        <MapaDibujo
          onPolygonChange={handlePolygonChange}
          apiKey={apiKey}
          initialPolygon={parcelaActual.coordenadas}
        />

        {parcelaActual.coordenadas.length >= 3 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Polígono completado
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700">
                  <strong>{parcelaActual.coordenadas.length}</strong> puntos
                </p>
                <p className="text-sm text-green-700">
                  <strong>{parcelaActual.area}</strong> hectáreas
                </p>
              </div>
            </div>
          </div>
        )}

        {errors["coordenadas"] && (
          <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {errors["coordenadas"]}
          </div>
        )}
      </div>

      {/* Usos de la Parcela (múltiples) */}
      <div className="border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
          🌾 Usos de la Parcela
        </h3>

        {parcelaActual.usos.map((uso, index) => (
          <div
            key={index}
            className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50 relative"
          >
            <button
              onClick={() => {
                setParcelaActual((prev) => ({
                  ...prev,
                  usos: prev.usos.filter((_, i) => i !== index),
                }));
              }}
              className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              title="Eliminar este uso"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Selector de tipo de uso */}
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Uso <span className="text-red-500">*</span>
            </label>
            <select
              value={uso.area}
              onChange={(e) => {
                const newArea = e.target.value;
                setParcelaActual((prev) => {
                  const nuevosUsos = [...prev.usos];
                  nuevosUsos[index] = {
                    area: newArea,
                    actividadesEspecificas: [],
                  };
                  return { ...prev, usos: nuevosUsos };
                });
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            >
              <option value="">Seleccionar área...</option>
              {Object.entries(USOS_PARCELA)
                // 🔧 Aquí está la lógica para evitar repetir áreas
                .filter(([key]) => {
                  // Deja pasar el área actual seleccionada o las que no están seleccionadas en otros usos
                  return !parcelaActual.usos.some(
                    (p, i) => i !== index && p.area === key,
                  );
                })
                .map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.label}
                  </option>
                ))}
            </select>

            {/* Actividades específicas */}
            {uso.area && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Actividades Específicas{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {USOS_PARCELA[uso.area].actividades.map((act) => (
                    <label
                      key={act.value}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                        uso.actividadesEspecificas.includes(act.value)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={uso.actividadesEspecificas.includes(act.value)}
                        onChange={() => {
                          setParcelaActual((prev) => {
                            const nuevosUsos = [...prev.usos];
                            const actividades =
                              nuevosUsos[index].actividadesEspecificas;
                            nuevosUsos[index].actividadesEspecificas =
                              actividades.includes(act.value)
                                ? actividades.filter((a) => a !== act.value)
                                : [...actividades, act.value];
                            return { ...prev, usos: nuevosUsos };
                          });
                        }}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <span>{act.label}</span>
                    </label>
                  ))}
                </div>
                {errors[`actEsp${uso.area}`] && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {errors[`actEsp${uso.area}`]}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Botón para agregar nuevo uso */}
        <button
          onClick={() => {
            setParcelaActual((prev) => ({
              ...prev,
              usos: [...prev.usos, { area: "", actividadesEspecificas: [] }],
            }));
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          <Plus className="w-5 h-5" />
          Agregar otro uso
        </button>

        {/* Validaciones */}
        {errors["usos"] && (
          <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {errors["usos"]}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          onClick={handleGuardarParcela}
          className={`flex-1 ${parcelaActual.id ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl`}
        >
          <Check className="w-5 h-5" />
          {parcelaActual.id ? "Actualizar Parcela" : "Guardar Parcela"}
        </button>
        <button
          onClick={handleLimpiar}
          className="px-8 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-4 rounded-lg transition flex items-center gap-2 shadow hover:shadow-md"
        >
          <Trash2 className="w-5 h-5" />
          Limpiar
        </button>
      </div>
    </div>
  );

  // Renderizar lista de parcelas
  const renderLista = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Parcelas Registradas ({parcelas.length})
        </h2>
        <p className="text-gray-600">Listado de todas las parcelas guardadas</p>
      </div>

      {parcelas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No hay parcelas registradas</p>
          <button
            onClick={() => setVistaActual("registro")}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Registrar Primera Parcela
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {parcelas.map((parcela, index) => (
            <div
              key={parcela.id}
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-300 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {parcela.nombre || `Parcela #${index + 1}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Registrada:{" "}
                    {new Date(parcela.fechaRegistro).toLocaleString("es-MX")}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-2xl font-bold text-green-600">
                    {parcela.area} ha
                  </p>
                  <p className="text-sm text-gray-600">
                    {parcela.coordenadas.length} puntos
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setParcelaActual(parcela);
                      setVistaActual("registro");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md hover:shadow-lg flex items-center gap-2"
                    title="Editar parcela"
                  >
                    <Key className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `¿Estás seguro de eliminar "${parcela.nombre}"?`,
                        )
                      ) {
                        setParcelas((prev) =>
                          prev.filter((p) => p.id !== parcela.id),
                        );
                        toast({
                          title: "Parcela Eliminada",
                          variant: "default",
                          className: "bg-green-50 border-green-200 text-green-900",
                        })
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md hover:shadow-lg flex items-center gap-2"
                    title="Eliminar parcela"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Ubicación - Ocupa todo el ancho */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    📍 Ubicación:
                  </h4>
                  <p className="text-sm text-gray-600">
                    <strong>Ciudad:</strong> {parcela.ciudad}
                    <br />
                    <strong>Municipio:</strong> {parcela.municipio}
                    <br />
                    <strong>Localidad:</strong> {parcela.localidad}
                    {parcela.direccionAdicional && (
                      <>
                        <br />
                        <strong>Adicional:</strong> {parcela.direccionAdicional}
                      </>
                    )}
                  </p>
                </div>

                {/* Usos - Todos en una sola fila */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    🌾 Usos de la Parcela:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {parcela.usos.map((act, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <p className="text-sm text-gray-600">
                          <strong className="text-green-700">
                            {USOS_PARCELA[act.area]?.label || act.area}
                          </strong>
                          <br />
                          <span className="text-xs text-gray-500">
                            Actividades:
                          </span>
                          <br />
                          {act.actividadesEspecificas.map((ae, ix) => (
                            <span
                              key={ix}
                              className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1 mt-1"
                            >
                              {ae}
                            </span>
                          ))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <MapaDibujo
                onPolygonChange={handlePolygonChange}
                initialPolygon={parcela.coordenadas}
                apiKey={apiKey}
                typeRegistro={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Navegación */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setVistaActual("registro")}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
              vistaActual === "registro"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border-2 border-gray-300"
            }`}
          >
            <Plus className="w-5 h-5" />
            Nueva Parcela
          </button>
          <button
            onClick={() => setVistaActual("lista")}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
              vistaActual === "lista"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border-2 border-gray-300"
            }`}
          >
            <Eye className="w-5 h-5" />
            Ver Parcelas ({parcelas.length})
          </button>
        </div>
        {vistaActual === "registro" ? renderRegistro() : renderLista()}
      </div>
    </div>
  );
}
