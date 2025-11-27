import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Plus,
  Save,
  Box,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  User,
  MapPin,
} from "lucide-react";
import {
  Apoyo,
  ApoyoPayload,
  getApoyos,
  createApoyo,
  updateApoyo,
  deleteApoyo,
} from "@/services/ApoyoService";
import ComponenteFiltrados from "@/components/ComponenteFiltrado";
import LoadingSDloading from "@/components/loadingSDloading";

// --- CONSTANTES ---
const ITEMS_PER_PAGE = 6; // Cantidad de tarjetas por página

const CONSTANTES_INSTITUCION = {
  institucion_encargada:
    "Secretaría de Desarrollo Agropecuario Agriculturo, Rural y Pesca",
  institucion_acronimo: "SEDARPE",
  direccion:
    "Av. Belice #201 entre San Salvador y Venustiano Carranza. Colonia Centro, C.P. 77000., Chetumal, Mexico",
  horarios_atencion: "L-V 9:00 a 15:00",
  telefono_contacto: "983 835 1630",
  correo_contacto: "null@null.null",
  redes_sociales: "https://www.facebook.com/desarrolloagropecuarioqroo",
  latitud_institucion: 18.5069468,
  longitud_institucion: -88.2960919,
};

// Beneficiados de prueba (solo front, para probar mientras no hay registro)


export default function GestionApoyos() {
  const [apoyos, setApoyos] = useState<Apoyo[]>([]);
  const [loadingApoyos, setLoadingApoyos] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- FILTROS Y PAGINACIÓN ---
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll al formulario
  const formTopRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    nombre_programa: "",
    descripcion: "",
    objetivo: "",
    tipo_objetivo: "",
    fechaInicio: "",
    fechaFin: "",
    Requerimientos: [] as any[],
  });

  // --- MODAL DE INSCRITOS ---
  const [showInscritos, setShowInscritos] = useState(false);
  const [apoyoSeleccionado, setApoyoSeleccionado] = useState<Apoyo | null>(
    null
  );
  const [inscritos, setInscritos] = useState<any[]>([]);

  // --- MODAL DE CITA POR PERSONA ---
  const [showCitaModal, setShowCitaModal] = useState(false);
  const [inscritoSeleccionado, setInscritoSeleccionado] = useState<any | null>(
    null
  );
  const [citaForm, setCitaForm] = useState({
    FechaCita: "",
    HoraCita: "",
    PropositoCita: "",
    Administrador: "",
  });

  useEffect(() => {
    loadApoyos();
  }, []);

  // Scroll cuando se abre el form
  useEffect(() => {
    if (showForm && formTopRef.current) {
      formTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showForm]);



const loadApoyos = async () => {
  setLoadingApoyos(true);
  try {
    const data = await getApoyos();
    setApoyos(data);
  } catch (e) {
    console.error(e);
  } finally {
    setLoadingApoyos(false);
  }
};

  const nuevosRequerimientos = (req: any) => {
    setFormData((prev) => ({ ...prev, Requerimientos: req }));
  };

  // --- FILTRADO Y PAGINACIÓN ---
  const filteredApoyos = useMemo(() => {
    return apoyos.filter((apoyo) => {
      const matchSearch = apoyo.nombre_programa
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchDate = dateFilter ? apoyo.fechaInicio === dateFilter : true;
      return matchSearch && matchDate;
    });
  }, [apoyos, searchTerm, dateFilter]);

  const totalPages = Math.ceil(filteredApoyos.length / ITEMS_PER_PAGE);
  const paginatedApoyos = filteredApoyos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  // --- FORM HANDLERS ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ApoyoPayload = {
      ...formData,
      ...CONSTANTES_INSTITUCION,
      Beneficiados: [], // al crear, vacío
    };

    try {
      if (editingId) await updateApoyo(editingId, payload);
      else await createApoyo(payload);

      await loadApoyos();
      setShowForm(false);
      resetInternalForm();
    } catch (error) {
      console.error(error);
    }
  };

  const resetInternalForm = () => {
    setFormData({
      nombre_programa: "",
      descripcion: "",
      objetivo: "",
      tipo_objetivo: "",
      fechaInicio: "",
      fechaFin: "",
      Requerimientos: [],
    });
    setEditingId(null);
  };

  const handleEdit = (apoyo: Apoyo) => {
    setEditingId(apoyo.id);
    setFormData({
      nombre_programa: apoyo.nombre_programa,
      descripcion: apoyo.descripcion,
      objetivo: apoyo.objetivo,
      tipo_objetivo: apoyo.tipo_objetivo,
      fechaInicio: apoyo.fechaInicio,
      fechaFin: apoyo.fechaFin,
      Requerimientos: apoyo.Requerimientos || [],
    });
    setShowForm(true);
  };

  // --- INSCRITOS / MODAL INSCRITOS ---

  const handleVerInscritos = (apoyo: Apoyo) => {
    setApoyoSeleccionado(apoyo);
    setInscritos(apoyo.Beneficiados || []);
    setShowInscritos(true);
  };

  const handleCerrarInscritos = () => {
    setShowInscritos(false);
    setApoyoSeleccionado(null);
    setInscritos([]);
  };

  const totalInscritos = inscritos.length;
  const totalConCita = inscritos.filter((i: any) => i?.agendacionCita).length;
  const totalSinCita = totalInscritos - totalConCita;

  // --- MODAL DE CITA POR PERSONA ---

  const handleAbrirCita = (persona: any) => {
    setInscritoSeleccionado(persona);

    const cita = persona.agendacionCita || {};
    setCitaForm({
      FechaCita: cita.FechaCita || "",
      HoraCita: cita.HoraCita || "",
      PropositoCita: cita.PropositoCita || "",
      Administrador: cita.Administrador || "",
    });

    setShowCitaModal(true);
  };

  const handleCerrarCita = () => {
    setShowCitaModal(false);
    setInscritoSeleccionado(null);
    setCitaForm({
      FechaCita: "",
      HoraCita: "",
      PropositoCita: "",
      Administrador: "",
    });
  };

  const handleGuardarCita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inscritoSeleccionado || !apoyoSeleccionado) return;

    const nuevaCita = { ...citaForm };

    // 1) Actualizar lista de inscritos del modal
    const nuevosInscritos = inscritos.map((p) =>
      p === inscritoSeleccionado ? { ...p, agendacionCita: nuevaCita } : p
    );
    setInscritos(nuevosInscritos);

    // 2) Actualizar el apoyo en la lista general
    const nuevosApoyos = apoyos.map((ap) => {
      if (ap.id !== apoyoSeleccionado.id) return ap;

      const nuevosBenef = (ap.Beneficiados || []).map((p: any) =>
        p === inscritoSeleccionado ? { ...p, agendacionCita: nuevaCita } : p
      );

      const actualizado = { ...ap, Beneficiados: nuevosBenef };
      if (apoyoSeleccionado.id === ap.id) {
        setApoyoSeleccionado(actualizado);
      }
      return actualizado;
    });

    setApoyos(nuevosApoyos);
    setShowCitaModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Apoyos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Administra los programas y subsidios activos.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            resetInternalForm();
          }}
          className={`${
            showForm
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-green-600 hover:bg-green-700"
          } text-white px-5 py-2.5 rounded-lg flex gap-2 transition shadow-sm font-medium`}
        >
          <Plus
            size={20}
            className={
              showForm
                ? "rotate-45 transition-transform"
                : "transition-transform"
            }
          />
          {showForm ? "Cerrar Formulario" : "Nuevo Programa"}
        </button>
      </div>

      {/* FORMULARIO */}
      <div ref={formTopRef}>
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-xl border border-gray-200 mb-10 overflow-hidden animate-fadeIn"
          >
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {editingId ? (
                  <Edit2 size={20} className="text-blue-600" />
                ) : (
                  <Plus size={20} className="text-green-600" />
                )}
                {editingId
                  ? "Editar Programa Existente"
                  : "Registrar Nuevo Programa"}
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* IZQUIERDA */}
              <div className="lg:col-span-4 space-y-5 border-r pr-6">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">
                  Información Básica
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">
                    Nombre del Programa
                  </label>
                  <input
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    value={formData.nombre_programa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombre_programa: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">
                    Descripción Pública
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">
                      Tipo (Económico...)
                    </label>
                    <input
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                      value={formData.tipo_objetivo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo_objetivo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">
                      Objetivo Corto
                    </label>
                    <input
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                      value={formData.objetivo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          objetivo: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">
                      Inicio Vigencia
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full border border-gray-300 rounded bg-white p-2 text-sm"
                      value={formData.fechaInicio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaInicio: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">
                      Fin Vigencia
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full border border-gray-300 rounded bg-white p-2 text-sm"
                      value={formData.fechaFin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaFin: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* DERECHA: REGLAS */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <Box className="text-green-600" />
                  <h3 className="font-bold text-lg text-gray-800">
                    Reglas de Filtrado de Productores
                  </h3>
                </div>

                <ComponenteFiltrados
                  requerimientos={formData.Requerimientos}
                  changeRequerimientos={nuevosRequerimientos}
                />

                <div className="pt-6 border-t flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
                  >
                    <Save size={18} />{" "}
                    {editingId ? "Guardar Cambios" : "Crear Apoyo"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* BARRA DE BÚSQUEDA/FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre del programa..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="date"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-600"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        {(searchTerm || dateFilter) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setDateFilter("");
            }}
            className="text-sm text-red-500 hover:text-red-700 font-medium px-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* LISTA DE APOYOS */}
      {loadingApoyos ? (
        <LoadingSDloading />
      ) : filteredApoyos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">
            No se encontraron apoyos con estos criterios.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {paginatedApoyos.map((a) => (
              <div
                key={a.id}
                className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {a.nombre_programa}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        a.Requerimientos?.length > 0
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-green-50 text-green-700 border-green-100"
                      }`}
                    >
                      {a.Requerimientos?.length || 0} Reglas
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        a.Beneficiados?.length
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : "bg-gray-50 text-gray-500 border-gray-100"
                      }`}
                    >
                      {a.Beneficiados?.length || 0} Inscritos
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {a.descripcion}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Inicio: {a.fechaInicio}</span>
                    <span>Fin: {a.fechaFin}</span>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleVerInscritos(a)}
                    className="flex-1 md:flex-none text-white bg-gray-800 hover:bg-gray-900 px-4 py-2 rounded-lg text-xs font-medium transition"
                  >
                    Ver Inscritos
                  </button>
                  <button
                    onClick={() => handleEdit(a)}
                    className="flex-1 md:flex-none text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-medium transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteApoyo(a.id).then(loadApoyos)}
                    className="flex-1 md:flex-none text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-xs font-medium transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <span className="text-sm font-medium text-gray-700">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL DE INSCRITOS */}
      {showInscritos && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={handleCerrarInscritos}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 pr-10">
              Inscritos en {apoyoSeleccionado?.nombre_programa}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Consulta a detalle las personas que han aplicado a este programa.
            </p>

            {/* Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-500">Total inscritos</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalInscritos}
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-xs text-green-700">Con cita agendada</p>
                <p className="text-xl font-bold text-green-800">
                  {totalConCita}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                <p className="text-xs text-yellow-700">Sin cita</p>
                <p className="text-xl font-bold text-yellow-800">
                  {totalSinCita}
                </p>
              </div>
            </div>

            {totalInscritos === 0 ? (
              <div className="py-10 text-center text-gray-500">
                Aún no hay personas inscritas en este apoyo.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inscritos.map((persona: any, idx: number) => {
                  const cita = persona.agendacionCita || {};
                  const tieneCita = !!cita.FechaCita;

                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-green-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {persona.Usuario || "Nombre no disponible"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Parcela: {persona.parcela || "N/D"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                            tieneCita
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-gray-50 text-gray-500 border border-gray-100"
                          }`}
                        >
                          {tieneCita ? "Con cita" : "Sin cita"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>
                            Fecha de registro:{" "}
                            {persona.fechaRegistro || "No disponible"}
                          </span>
                        </div>

                        {persona.ubicacion && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span>{persona.ubicacion}</span>
                          </div>
                        )}

                        {tieneCita && (
                          <div className="mt-2 bg-green-50 border border-green-100 rounded-lg p-2">
                            <p className="text-[11px] font-semibold text-green-800 mb-1">
                              Detalles de la cita
                            </p>
                            <p className="text-[11px] text-green-900">
                              <span className="font-semibold">Fecha:</span>{" "}
                              {cita.FechaCita}
                            </p>
                            <p className="text-[11px] text-green-900">
                              <span className="font-semibold">Hora:</span>{" "}
                              {cita.HoraCita || "No especificada"}
                            </p>
                            {cita.PropositoCita && (
                              <p className="text-[11px] text-green-900">
                                <span className="font-semibold">
                                  Propósito:
                                </span>{" "}
                                {cita.PropositoCita}
                              </p>
                            )}
                            {cita.Administrador && (
                              <p className="text-[11px] text-green-900">
                                <span className="font-semibold">
                                  Atenderá:
                                </span>{" "}
                                {cita.Administrador}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAbrirCita(persona)}
                          className="px-3 py-1.5 text-[11px] rounded-lg font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                        >
                          {tieneCita ? "Editar cita" : "Agendar cita"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCerrarInscritos}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CITA */}
      {showCitaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <form
            onSubmit={handleGuardarCita}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
          >
            <button
              type="button"
              onClick={handleCerrarCita}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1 pr-8">
              {inscritoSeleccionado?.Usuario
                ? `Cita para ${inscritoSeleccionado.Usuario}`
                : "Agendar cita"}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Define la fecha, hora y propósito de la cita para este productor.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Fecha de cita
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    value={citaForm.FechaCita}
                    onChange={(e) =>
                      setCitaForm({ ...citaForm, FechaCita: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    value={citaForm.HoraCita}
                    onChange={(e) =>
                      setCitaForm({ ...citaForm, HoraCita: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Propósito de la cita
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  placeholder="Ej. Entrega de documentos, validación de requisitos, seguimiento de apoyo..."
                  value={citaForm.PropositoCita}
                  onChange={(e) =>
                    setCitaForm({
                      ...citaForm,
                      PropositoCita: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nombre del administrador que atenderá
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Ej. Ing. Martínez"
                  value={citaForm.Administrador}
                  onChange={(e) =>
                    setCitaForm({
                      ...citaForm,
                      Administrador: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={handleCerrarCita}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Guardar cita
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
