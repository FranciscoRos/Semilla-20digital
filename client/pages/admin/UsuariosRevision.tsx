import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPerfilesPendientes,
  aprobarPerfilRegistro,
  rechazarPerfilRegistro,
  agregarComentario,
} from "@/services/PendientesReviService";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  User,
  Home,
  MapPin,
  CalendarClock,
  Edit2,
  History,
  MessageSquare,
  PlusCircle,
  Clock,
  Search
} from "lucide-react";
import FormularioUsuarioParcelas from "../auth/RegisterProducer";
import { useAuth } from "@/providers/authProvider";

export default function UsuariosRevision() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendientes, setPendientes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPerfil, setSelectedPerfil] = useState(null);
  const [rechazar, setRechazar] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [comentario, setComentario] = useState("");
  
  const [showAgendarModal, setShowAgendarModal] = useState(false);
  const [citaForm, setCitaForm] = useState({ fecha: "", hora: "No Definida", proposito: "" });

  const [showModificarModal, setShowModificarModal] = useState(false);

  // --- LÓGICA DE TIEMPO ---
  // Generamos slots de tiempo cada 30 minutos entre las 9:00 AM y las 6:00 PM
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour <= endHour; hour++) {
      const hourString = hour.toString().padStart(2, '0');
      slots.push(`${hourString}:00`);
      
      if (hour !== endHour) {
        slots.push(`${hourString}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      try {
        const data = await getPerfilesPendientes();
        setPendientes(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (err) {
        console.error("Error cargando pendientes:", err);
      } finally {
        setLoadingList(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedId) {
        setSelectedPerfil(null);
        return;
      }
      setLoadingDetail(true);
      try {
        const data = pendientes.find((p) => p.id === selectedId);
        setSelectedPerfil(data);
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoadingDetail(false);
      }
    };
    loadDetail();
  }, [selectedId, pendientes]);

  const filteredPendientes = pendientes.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const { Nombre, Apellido1, Apellido2, Correo } = p.Usuario;
    
    const nombreCompleto = `${Nombre || ''} ${Apellido1 || ''} ${Apellido2 || ''}`.toLowerCase();
    const email = (Correo || '').toLowerCase();

    return nombreCompleto.includes(term) || email.includes(term);
  });

  const handleApprove = async () => {
    if (!selectedPerfil) return;
    if (!confirm("¿Estás seguro de aprobar este perfil?")) return;
    try {
      await aprobarPerfilRegistro(selectedPerfil.id);
      removeProfileFromList(selectedPerfil.id);
    } catch (err) {
      console.error("Error aprobando perfil:", err);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedPerfil) return;
    if (rechazar === false) return await agregarComentarioRevision();
    if (!comentario.trim()) {
      alert("Escribe un motivo de rechazo.");
      return;
    }
    try {
      await rechazarPerfilRegistro(selectedPerfil.id, comentario);
      removeProfileFromList(selectedPerfil.id);
      setShowRechazoModal(false);
      setComentario("");
      setRechazar(false);
    } catch (err) {
      console.error("Error rechazando perfil:", err);
    }
  };

  const agregarComentarioRevision = async () => {
    try {
        await agregarComentario(selectedPerfil.id, user.id, comentario);
        setShowRechazoModal(false);
        setComentario("");
    } catch (err) {
        console.error("Error agregando comentario", err);
    }
  };

  const handleSaveCita = () => {
    if (!citaForm.fecha) {
        alert("Por favor selecciona fecha.");
        return;
    }
    console.log("Guardando cita:", citaForm);
    alert("Cita agendada (Simulación)");
    setShowAgendarModal(false);
    setCitaForm({ fecha: "", hora: "", proposito: "" });
  };

  const removeProfileFromList = (id) => {
    const newList = pendientes.filter((p) => p.id !== id);
    setPendientes(newList);
    if (selectedId === id) {
        setSelectedId(newList.length > 0 ? newList[0].id : null);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-full border p-1 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Pendientes de revisión
          </h1>
          <p className="text-sm text-gray-500">
            Administra las solicitudes de registro, agenda citas y revisa el historial.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[300px,1fr] gap-6">
        
        <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-[calc(100vh-140px)] overflow-y-auto flex flex-col">
          <div className="mb-4">
             <div className="flex justify-between items-baseline mb-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Solicitudes ({filteredPendientes.length})
                </h2>
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
             </div>
          </div>

          {loadingList && <p className="text-xs text-gray-500 animate-pulse text-center mt-4">Cargando lista...</p>}

          {!loadingList && pendientes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-100 mb-2"/>
                <p className="text-xs text-gray-400">Todo al día.</p>
            </div>
          )}

          {!loadingList && pendientes.length > 0 && filteredPendientes.length === 0 && (
             <div className="flex flex-col items-center justify-center h-20 text-center mt-4">
                <p className="text-xs text-gray-400">No se encontraron resultados para "{searchTerm}"</p>
             </div>
          )}

          <div className="space-y-2">
            {filteredPendientes.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                  selectedId === p.id
                    ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                    : "border-gray-100 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-800 text-sm truncate">
                  {p.Usuario.Nombre} {p.Usuario.Apellido1} {p.Usuario.Apellido2}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                  <User size={12} /> {p.Usuario.Correo}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-140px)] overflow-hidden flex flex-col">
          {loadingDetail && (
             <div className="flex items-center justify-center h-full">
                 <p className="text-sm text-gray-400 animate-pulse">Cargando información...</p>
             </div>
          )}

          {!loadingDetail && !selectedPerfil && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <User className="w-16 h-16 mb-4 text-gray-200" />
              <p>Selecciona un productor para ver el detalle</p>
            </div>
          )}

          {selectedPerfil && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                
                <section>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                    <User className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-800">Información Personal</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 text-sm">
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Nombre Completo</span>
                        <span className="font-medium text-gray-900">{selectedPerfil.Usuario.Nombre} {selectedPerfil.Usuario.Apellido1} {selectedPerfil.Usuario.Apellido2}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">CURP</span>
                        <span className="font-medium text-gray-900">{selectedPerfil.Usuario.Curp}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">RFC</span>
                        <span className="font-medium text-gray-900">{selectedPerfil.Usuario.Rfc}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Correo</span>
                        <span className="font-medium text-gray-900">{selectedPerfil.Usuario.Correo}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Teléfono</span>
                        <span className="font-medium text-gray-900">{selectedPerfil.Usuario.Telefono}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Fecha Nacimiento</span>
                        <span className="font-medium text-gray-900">{formatDate(selectedPerfil.Usuario.FechaNacimiento)}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                    <Home className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-gray-800">Domicilio</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 text-sm">
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Calle</span>
                        <span className="font-medium text-gray-900">{selectedPerfil.Usuario.Domicilio.Calle}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Colonia</span>
                        <span className="font-medium text-gray-900">{selectedPerfil.Usuario.Domicilio.Colonia}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Código Postal</span>
                        <span className="font-medium text-gray-900">{selectedPerfil.Usuario.Domicilio.CodigoPostal}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Municipio / Ciudad</span>
                        <span className="font-medium text-gray-900">{selectedPerfil.Usuario.Domicilio.Municipio}, {selectedPerfil.Usuario.Domicilio.Ciudad}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Estado</span>
                        <span className="font-medium text-gray-900">{selectedPerfil.Usuario.Domicilio.Estado}</span>
                    </div>
                  </div>
                </section>
                
                {selectedPerfil.Usuario.Parcela && selectedPerfil.Usuario.Parcela.length > 0 && (
                  <section className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <h2 className="text-lg font-semibold text-gray-800">
                        Parcelas registradas
                      </h2>
                      <span className="text-lg text-gray-500">
                        ({selectedPerfil.Usuario.Parcela.length})
                      </span>
                    </div> 
                  </section>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <section className="flex flex-col">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                             <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-orange-600" />
                                <h2 className="text-lg font-bold text-gray-800">Revision</h2>
                             </div>
                        </div>
                        
                        <div className="flex-1 bg-gray-50 rounded-xl p-4 space-y-3">
                             {selectedPerfil.Usuario.Revision.Administrador ? (
                                    <div key={selectedPerfil.id} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-orange-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-sm text-gray-800">
                                              Revisado por:  {selectedPerfil.Usuario.Revision.Administrador}
                                            </span>
                                            <span className="text-xs text-gray-400">{formatDate(selectedPerfil.Usuario.Revision.FechaRevision)}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded italic">
                                            "{selectedPerfil.Usuario.Revision.ComentariosRevision}"
                                        </p>
                                    </div>
                             ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                                    <MessageSquare className="w-8 h-8 text-gray-300 mb-2"/>
                                    <p className="text-sm text-gray-500 mb-3">No hay revisiones previas.</p>
                                    <button 
                                        onClick={() => setShowRechazoModal(true)}
                                        className="text-xs flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-colors"
                                    >
                                        <PlusCircle size={14}/> Agregar comentario
                                    </button>
                                </div>
                             )}
                        </div>
                    </section>

                    <section className="flex flex-col">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                             <div className="flex items-center gap-2">
                                <CalendarClock className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg font-bold text-gray-800">Citas</h2>
                             </div>
                        </div>

                        <div className="flex-1 bg-gray-50 rounded-xl p-4 space-y-3">
                            {selectedPerfil.Usuario.agendacionCita.Administrador ? (
                                    <div key={selectedPerfil.id} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-purple-500">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                                <CalendarClock size={16} className="text-purple-600"/>
                                                {formatDate(selectedPerfil.Usuario.agendacionCita.FechaCita)}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                                <Clock size={12}/> {selectedPerfil.Usuario.agendacionCita.HoraCita}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">Agendado por: {selectedPerfil.Usuario.agendacionCita.Administrador}</p>
                                        <p className="text-sm text-gray-700 border-t pt-2 mt-1">
                                            {selectedPerfil.Usuario.agendacionCita.PropositoCita}
                                        </p>
                                    </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                                    <CalendarClock className="w-8 h-8 text-gray-300 mb-2"/>
                                    <p className="text-sm text-gray-500 mb-3">No hay citas programadas.</p>
                                    <button 
                                        onClick={() => setShowAgendarModal(true)}
                                        className="text-xs flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-colors"
                                    >
                                        <PlusCircle size={14}/> Agendar cita
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

              </div>

              <div className="bg-white border-t border-gray-200 p-4 flex flex-wrap gap-3 justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowModificarModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modificar Datos
                  </button>

                  <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setShowAgendarModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-sm font-medium hover:bg-purple-100 transition-colors"
                    >
                        <CalendarClock className="w-4 h-4" />
                        Agendar Cita
                    </button>

                    <button
                        type="button"
                        onClick={() =>{ setShowRechazoModal(true); setRechazar(true)}}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                    </button>

                    <button
                        type="button"
                        onClick={handleApprove}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white shadow-md shadow-green-200 text-sm font-medium hover:bg-green-700 transition-all hover:shadow-lg"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Aprobar Registro
                    </button>
                  </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showRechazoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <XCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-red-900">{rechazar ? "Rechazar Solicitud" : "Agregar Observación"}</h2>
                    <p className="text-xs text-red-700">Esta acción notificará al usuario para correcciones u observaciones.</p>
                </div>
            </div>
            
            <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {rechazar ? "Motivo del rechazo" : "Observaciones"} <span className="text-orange-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                  placeholder="Describe detalladamente las observaciones o correcciones al usuario..."
                />
            </div>

            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {setShowRechazoModal(false); setComentario(""); setRechazar(false);}}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAgendarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="bg-purple-50 p-4 border-b border-purple-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <CalendarClock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-purple-900">Agendar Cita</h2>
                    <p className="text-xs text-purple-700">Define fecha y hora para revisión presencial.</p>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
                        <input
                            type="date"
                            value={citaForm.fecha}
                            onChange={(e) => setCitaForm({...citaForm, fecha: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                            <select
                                value={citaForm.hora}
                                onChange={(e) => setCitaForm({...citaForm, hora: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
                            >
                                <option value="No Definida">Seleccionar...</option>
                                {timeSlots.map((time) => (
                                    <option key={time} value={time}>
                                        {time} hrs
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Propósito / Detalles
                  </label>
                  <textarea
                    rows={3}
                    value={citaForm.proposito}
                    onChange={(e) => setCitaForm({...citaForm, proposito: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                    placeholder="Ej: Revisión de linderos..."
                  ></textarea>
                </div>
            </div>

            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAgendarModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCita}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModificarModal && selectedPerfil && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModificarModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e)=>e.stopPropagation()}>
            
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Modificar Información del Productor</h2>
                <button 
                    onClick={() => setShowModificarModal(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <XCircle size={24} className="text-gray-500"/>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
                 <FormularioUsuarioParcelas user={selectedPerfil.Usuario} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setShowModificarModal(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cerrar Edición
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}