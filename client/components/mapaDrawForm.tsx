import { useState, useRef, useEffect } from "react";
import { Check, AlertCircle, MapPin, Trash2, Plus, Eye } from "lucide-react";

import MapaDibujo from "./mapaDraw";

// Catálogo de usos de parcela (área y actividades específicas)
const USOS_PARCELA = {
  agricultura: {
    label: "Agricultura",
    actividades: [
      { value: "maiz", label: "Siembra de Maíz" },
      { value: "frijol", label: "Siembra de Frijol" },
      { value: "chile", label: "Siembra de Chile" },
      { value: "tomate", label: "Siembra de Tomate" },
      { value: "calabaza", label: "Siembra de Calabaza" },
      { value: "hortalizas", label: "Cultivo de Hortalizas" },
      { value: "frutas", label: "Cultivo de Frutas" }
    ]
  },
  ganaderia: {
    label: "Ganadería",
    actividades: [
      { value: "vacas", label: "Cría de Vacas" },
      { value: "cerdos", label: "Cría de Cerdos" },
      { value: "ovejas", label: "Cría de Ovejas" },
      { value: "cabras", label: "Cría de Cabras" },
      { value: "pollos", label: "Cría de Pollos" },
      { value: "caballos", label: "Cría de Caballos" }
    ]
  },
  pesca: {
    label: "Pesca/Acuacultura",
    actividades: [
      { value: "mojarra", label: "Cría de Mojarra" },
      { value: "tilapia", label: "Cría de Tilapia" },
      { value: "camaron", label: "Cría de Camarón" },
      { value: "trucha", label: "Cría de Trucha" },
      { value: "carpa", label: "Cría de Carpa" },
      { value: "bagre", label: "Cría de Bagre" }
    ]
  }
};



// Componente principal: Registro de Parcelas
export default function RegistroParcelas() {
  const [parcelas, setParcelas] = useState([]);
  const [vistaActual, setVistaActual] = useState('registro'); // 'registro' o 'lista'
  
  // Datos de la parcela actual
  const [parcelaActual, setParcelaActual] = useState({
    ciudad: '',
    municipio: '',
    localidad: '',
    direccionAdicional: '',
    coordenadas: [],
    area: 0,
    areaUso: '', // agricultura, ganaderia, pesca
    actividadesEspecificas: [] // maiz, vacas, mojarra, etc.
  });

  const [errors, setErrors] = useState({});

  // Manejar cambios en el polígono del mapa
  const handlePolygonChange = ({ coordinates, area }) => {
    setParcelaActual(prev => ({
      ...prev,
      coordenadas: coordinates,
      area: parseFloat(area)
    }));
    if (coordinates.length >= 3) {
      setErrors(prev => ({ ...prev, coordenadas: null }));
    }
  };

  // Manejar cambio de área de uso
  const handleAreaUsoChange = (e) => {
    const areaUso = e.target.value;
    setParcelaActual(prev => ({
      ...prev,
      areaUso,
      actividadesEspecificas: [] // Resetear actividades al cambiar área
    }));
    setErrors(prev => ({ ...prev, areaUso: null }));
  };

  // Manejar cambio de actividades específicas
  const handleActividadToggle = (actividad) => {
    setParcelaActual(prev => {
      const actividades = prev.actividadesEspecificas.includes(actividad)
        ? prev.actividadesEspecificas.filter(a => a !== actividad)
        : [...prev.actividadesEspecificas, actividad];
      
      return { ...prev, actividadesEspecificas: actividades };
    });
    setErrors(prev => ({ ...prev, actividadesEspecificas: null }));
  };

  // Validar y guardar parcela
  const handleGuardarParcela = () => {
    const newErrors = {};

    // Validaciones
    if (!parcelaActual.ciudad.trim()) {
      newErrors['ciudad'] = 'La ciudad es obligatoria';
    }
    if (!parcelaActual.municipio.trim()) {
      newErrors['municipio'] = 'El municipio es obligatorio';
    }
    if (!parcelaActual.localidad.trim()) {
      newErrors['localidad'] = 'La localidad es obligatoria';
    }
    if (parcelaActual.coordenadas.length < 3) {
      newErrors['coordenadas'] = 'Debes dibujar el polígono de la parcela';
    }
    if (!parcelaActual.areaUso) {
      newErrors['areaUso'] = 'Selecciona el área de uso';
    }
    if (parcelaActual.actividadesEspecificas.length === 0) {
      newErrors['actividadesEspecificas'] = 'Selecciona al menos una actividad';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Crear objeto de parcela con estructura definida
    const nuevaParcela = {
      id: Date.now(),
      ciudad: parcelaActual.ciudad,
      municipio: parcelaActual.municipio,
      localidad: parcelaActual.localidad,
      direccionAdicional: parcelaActual.direccionAdicional,
      coordenadas: parcelaActual.coordenadas,
      area: parcelaActual.area,
      uso: {
        area: parcelaActual.areaUso,
        areaLabel: USOS_PARCELA[parcelaActual.areaUso].label,
        actividades: parcelaActual.actividadesEspecificas,
        actividadesLabels: parcelaActual.actividadesEspecificas.map(act => {
          const actividad = USOS_PARCELA[parcelaActual.areaUso].actividades.find(a => a.value === act);
          return actividad?.label || act;
        })
      },
      fechaRegistro: new Date().toISOString()
    };

    // Agregar a la lista de parcelas
    setParcelas(prev => [...prev, nuevaParcela]);

    // Aquí guardarías en tu base de datos
    console.log('Nueva parcela guardada:', nuevaParcela);
    console.log('Arreglo completo de parcelas:', [...parcelas, nuevaParcela]);

    // Limpiar formulario
    setParcelaActual({
      ciudad: '',
      municipio: '',
      localidad: '',
      direccionAdicional: '',
      coordenadas: [],
      area: 0,
      areaUso: '',
      actividadesEspecificas: []
    });
    setErrors({});

    // Mostrar mensaje de éxito
    alert('Parcela registrada');
  };

  // Limpiar formulario
  const handleLimpiar = () => {
    setParcelaActual({
      ciudad: '',
      municipio: '',
      localidad: '',
      direccionAdicional: '',
      coordenadas: [],
      area: 0,
      areaUso: '',
      actividadesEspecificas: []
    });
    setErrors({});
  };

  // Renderizar vista de registro
  const renderRegistro = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Registro de Nueva Parcela
        </h2>
        <p className="text-gray-600">
          Completa todos los campos y dibuja el polígono en el mapa
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
                setParcelaActual(prev => ({ ...prev, ciudad: e.target.value }));
                setErrors(prev => ({ ...prev, ciudad: null }));
              }}
              placeholder="Ej: Cancún"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors['ciudad'] ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors['ciudad'] && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors['ciudad']}
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
                setParcelaActual(prev => ({ ...prev, municipio: e.target.value }));
                setErrors(prev => ({ ...prev, municipio: null }));
              }}
              placeholder="Ej: Benito Juárez"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors['municipio'] ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors['municipio'] && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors['municipio']}
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
                setParcelaActual(prev => ({ ...prev, localidad: e.target.value }));
                setErrors(prev => ({ ...prev, localidad: null }));
              }}
              placeholder="Ej: Región 100"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors['localidad'] ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors['localidad'] && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors['localidad']}
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
              onChange={(e) => setParcelaActual(prev => ({ ...prev, direccionAdicional: e.target.value }))}
              placeholder="Ej: A 2km de la carretera principal"
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

        {errors['coordenadas'] && (
          <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {errors['coordenadas']}
          </div>
        )}
      </div>

      {/* Uso de la Parcela */}
      <div className="border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
          🌾 Uso de la Parcela
        </h3>

        {/* Área de Uso */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Área de Uso <span className="text-red-500">*</span>
          </label>
          <select
            value={parcelaActual.areaUso}
            onChange={handleAreaUsoChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 ${
              errors['areaUso'] ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar área...</option>
            {Object.entries(USOS_PARCELA).map(([key, data]) => (
              <option key={key} value={key}>{data.label}</option>
            ))}
          </select>
          {errors['areaUso'] && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errors['areaUso']}
            </div>
          )}
        </div>

        {/* Actividades Específicas */}
        {parcelaActual.areaUso && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Actividades Específicas <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2">(Selecciona todas las que apliquen)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {USOS_PARCELA[parcelaActual.areaUso].actividades.map(actividad => (
                <label
                  key={actividad.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                    parcelaActual.actividadesEspecificas.includes(actividad.value)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  } ${errors['actividadesEspecificas'] ? 'border-red-300' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={parcelaActual.actividadesEspecificas.includes(actividad.value)}
                    onChange={() => handleActividadToggle(actividad.value)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span>{actividad.label}</span>
                </label>
              ))}
            </div>
            {errors['actividadesEspecificas'] && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors['actividadesEspecificas']}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          onClick={handleGuardarParcela}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Guardar Parcela
        </button>
        <button
          onClick={handleLimpiar}
          className="px-8 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-4 rounded-lg transition flex items-center gap-2"
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
        <p className="text-gray-600">
          Listado de todas las parcelas guardadas
        </p>
      </div>

      {parcelas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No hay parcelas registradas</p>
          <button
            onClick={() => setVistaActual('registro')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Registrar Primera Parcela
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {parcelas.map((parcela, index) => (
            <div key={parcela.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-300 transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Parcela #{index + 1}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Registrada: {new Date(parcela.fechaRegistro).toLocaleString('es-MX')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{parcela.area} ha</p>
                  <p className="text-sm text-gray-600">{parcela.coordenadas.length} puntos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">📍 Ubicación:</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Ciudad:</strong> {parcela.ciudad}<br />
                    <strong>Municipio:</strong> {parcela.municipio}<br />
                    <strong>Localidad:</strong> {parcela.localidad}
                    {parcela.direccionAdicional && (
                      <><br /><strong>Adicional:</strong> {parcela.direccionAdicional}</>
                    )}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🌾 Uso:</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Área:</strong> {parcela.uso.areaLabel}<br />
                    <strong>Actividades:</strong><br />
                    {parcela.uso.actividadesLabels.map((act, i) => (
                      <span key={i} className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-2 mt-1">
                        {act}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => console.log('Ver detalles:', parcela)}
                  className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Ver coordenadas completas en consola
                </button>
              </div>
              <MapaDibujo 
          onPolygonChange={handlePolygonChange}
          initialPolygon={parcela.coordenadas}
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
            onClick={() => setVistaActual('registro')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
              vistaActual === 'registro'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            <Plus className="w-5 h-5" />
            Nueva Parcela
          </button>
          <button
            onClick={() => setVistaActual('lista')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
              vistaActual === 'lista'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            <Eye className="w-5 h-5" />
            Ver Parcelas ({parcelas.length})
          </button>
        </div>

        {/* Vista actual */}
        {vistaActual === 'registro' ? renderRegistro() : renderLista()}

        {/* Debug: Mostrar estructura de datos */}
        {(parcelas.length > 0 && vistaActual==='lista') && (
          <div className="mt-6 p-4 bg-gray-900 text-white rounded-lg">
            <p className="text-sm font-mono mb-2">📊 Estructura de datos (últimas 2 parcelas):</p>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(parcelas.slice(-2), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}