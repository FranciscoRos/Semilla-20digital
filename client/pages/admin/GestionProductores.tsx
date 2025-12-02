import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  Home,
  MapPin,
  Phone,
  Mail,
  Search,
  BadgeCheck,
  Calendar,
  X,
  XCircle,
  FileText,
} from "lucide-react";
import type { PerfilRegistro } from "@/services/PendientesReviService";
import { useRegistros } from "@/hooks/useRegistros";
import { useRevisionRegistro } from "@/hooks/useRevisionRegistro";
import { toast } from "@/hooks/use-toast";

export default function GestionProductores() {
  const navigate = useNavigate();
  const { productores, loadingRegistros, refetchRegistros } = useRegistros();

  const {
    handleCitaProductor,
    handleRevisionProductor,
    handleChangeEstado,
    loadingCita,
    loadingRevision,
  } = useRevisionRegistro(() => {
    refetchRegistros();
  });

  const [error] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [showCitaModal, setShowCitaModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [productorSel, setProductorSel] = useState<PerfilRegistro | null>(null);
  const [rechazo,setRechazo]=useState(false)

  const [citaForm, setCitaForm] = useState({
    FechaCita: "",
    HoraCita: "",
    PropositoCita: "",
  });

  const [comentarioRevision, setComentarioRevision] = useState("");

 
  const [citasLocales, setCitasLocales] = useState<Record<string, any>>({});

  const filtrados = useMemo(() => {
    if (!searchTerm) return productores;
    const term = searchTerm.toLowerCase();

    return productores.filter((p) => {
      const u = p.Usuario;
      const nombreCompleto = `${u.Nombre || ""} ${u.Apellido1 || ""} ${
        u.Apellido2 || ""
      }`.toLowerCase();
      const curp = (u.Curp || "").toLowerCase();
      const correo = (u.Correo || "").toLowerCase();

      return (
        nombreCompleto.includes(term) ||
        curp.includes(term) ||
        correo.includes(term)
      );
    });
  }, [productores, searchTerm]);

  const mapEstadoToOption = (estado: string | undefined): string => {
    if (estado === "Activo") return "En revisión";
    if (
      estado === "Verificado" ||
      estado === "Pendiente" ||
      estado === "Rechazado"
    ) {
      return estado;
    }
    return "Pendiente";
  };

  const mapOptionToEstado = (
    option: string
  ): "Verificado" | "Rechazado" | "Pendiente" | "Activo" => {
    if (option === "En revisión") return "Activo";
    if (
      option === "Verificado" ||
      option === "Pendiente" ||
      option === "Rechazado"
    ) {
      return option;
    }
    return "Pendiente";
  };

  const getEstadoBadgeClasses = (estado: string | undefined): string => {
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "Rechazado":
        return "bg-red-100 text-red-700";
      case "Verificado":
        return "bg-emerald-100 text-emerald-700";
      case "Activo":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };


  // ---------- CITA ----------
  const abrirCita = (productor: PerfilRegistro) => {
    setProductorSel(productor);
    const citaLocal = citasLocales[productor.id];
    const cita = citaLocal || (productor as any).agendacionCita || {};
    setCitaForm({
      FechaCita: cita.FechaCita || "",
      HoraCita: cita.HoraCita || "",
      PropositoCita: cita.PropositoCita || "",
    });
    setShowCitaModal(true);
  };

  const cerrarCita = () => {
    setShowCitaModal(false);
    setProductorSel(null);
    setCitaForm({
      FechaCita: "",
      HoraCita: "",
      PropositoCita: "",
    });
  };

  const guardarCita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productorSel) return;
    if (!citaForm.FechaCita || !citaForm.HoraCita || !citaForm.PropositoCita) {
      toast({
        title: "Por favor llene todos los campos de la cita.",
        variant: "default",
        className: "bg-amber-50 border-amber-200 text-amber-900",
        duration: 3000,
      });
      return;
    }

    // Back
    handleCitaProductor.mutate({
      idProc: productorSel.id,
      data: {
        FechaCita: new Date(citaForm.FechaCita),
        HoraCita: citaForm.HoraCita,
        PropositoCita: citaForm.PropositoCita,
      },
    });

    // Front inmediato
    setCitasLocales((prev) => ({
      ...prev,
      [productorSel.id]: {
        ...(prev[productorSel.id] || {}),
        FechaCita: citaForm.FechaCita,
        HoraCita: citaForm.HoraCita,
        PropositoCita: citaForm.PropositoCita,
      },
    }));

    cerrarCita();
  };

  // ---------- REVISIÓN (OBSERVACIONES) ----------
  const abrirRevision = (productor: PerfilRegistro) => {
    setProductorSel(productor);
    setComentarioRevision("");
    setShowRevisionModal(true);
  };

  const cerrarRevision = () => {
    setShowRevisionModal(false);
    setProductorSel(null);
    setComentarioRevision("");
  };

  const guardarRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productorSel) return;
    if (!comentarioRevision.trim()) {
      toast({
        title: "Escriba un comentario de revisión.",
        variant: "default",
        className: "bg-orange-50 border-orange-200 text-orange-900",
        duration: 3000,
      });
      return;
    }
    handleRevisionProductor.mutate({
      idProc: productorSel.id,
      data: {
        FechaRevision: new Date(),
        ComentariosRevision: comentarioRevision,
      },
    });
    if(rechazo)handleChangeEstado.mutate({
      idProc: productorSel.id,
      data: {
        Estado: "Rechazado",
      },
    })
    

    cerrarRevision();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Productores registrados
              </h1>
            </div>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, CURP o correo..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loadingRegistros && (
          <p className="text-sm text-gray-600">
            Cargando productores registrados...
          </p>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {!loadingRegistros && !error && filtrados.length === 0 && (
          <p className="text-sm text-gray-600">
            No se encontraron productores registrados con el criterio de
            búsqueda.
          </p>
        )}

        {!loadingRegistros && !error && filtrados.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Productor
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    CURP
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Domicilio
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Parcela principal
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Cita
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Estado / Revisión
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const u = p.Usuario;
                  const dom = u.Domicilio || {
                    Municipio: null,
                    Ciudad: null,
                    Estado: null,
                  };
                  const parcelaPrincipal =
                    u.Parcela && u.Parcela.length > 0 ? u.Parcela[0] : null;

                  const nombreCompleto = `${u.Nombre || ""} ${
                    u.Apellido1 || ""
                  } ${u.Apellido2 || ""}`.trim();

                  const citaLocal = citasLocales[p.id];
                  const cita = citaLocal || (p as any).agendacionCita || {};
                  const tieneCita = !!(
                    cita.FechaCita ||
                    cita.HoraCita ||
                    cita.PropositoCita
                  );

                  return (
                    <tr
                      key={p.id}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      {/* Productor */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
                            <User className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {nombreCompleto || "Sin nombre"}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID Usuario: {u.idUsuario || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CURP */}
                      <td className="px-4 py-3 text-gray-700">
                        {u.Curp || "-"}
                      </td>

                      {/* Contacto */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{u.Telefono || "-"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[200px]">
                              {u.Correo || "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Domicilio */}
                      <td className="px-4 py-3">
                        <div className="space-y-1 text-gray-700">
                          <div className="flex items-center gap-1">
                            <Home className="w-4 h-4 text-gray-400" />
                            <span>{dom.Municipio || dom.Ciudad || "-"}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {dom.Ciudad && dom.Estado
                              ? `${dom.Ciudad}, ${dom.Estado}`
                              : dom.Estado || ""}
                          </p>
                        </div>
                      </td>

                      {/* Parcela principal */}
                      <td className="px-4 py-3">
                        {parcelaPrincipal ? (
                          <div className="space-y-1 text-gray-700">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>
                                {parcelaPrincipal.municipio ||
                                  parcelaPrincipal.ciudad ||
                                  "-"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {parcelaPrincipal.localidad ||
                                parcelaPrincipal.direccionAdicional ||
                                ""}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Sin parcela registrada
                          </span>
                        )}
                      </td>

                      {/* Cita */}
                      <td className="px-4 py-3">
                        {tieneCita ? (
                          <div className="space-y-1 text-xs text-gray-700">
                            <p className="font-medium">
                              {cita.FechaCita
                                ? new Date(
                                    cita.FechaCita
                                  ).toLocaleDateString()
                                : "Sin fecha"}
                              {cita.HoraCita && ` · ${cita.HoraCita}`}
                            </p>
                            {cita.PropositoCita && (
                              <p className="text-gray-500 truncate max-w-[180px]">
                                {cita.PropositoCita}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs block mb-1">
                            Sin cita
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => abrirCita(p)}
                          className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border border-blue-100 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-60"
                          disabled={loadingCita}
                        >
                          <Calendar className="w-3 h-3" />
                          {tieneCita ? "Editar cita" : "Agendar cita"}
                        </button>
                      </td>

                      {/* Estado / Revisión */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClasses(
                              p.Estado
                            )}`}
                          >
                            <BadgeCheck className="w-3 h-3" />
                            {p.Estado || "Sin estado"}
                          </span>

                          <select
                            className="border border-gray-200 rounded-lg text-xs px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            value={mapEstadoToOption(p.Estado)}
                            disabled={loadingRevision}
                            onChange={(e) =>{
                              if (confirm(`¿Estas seguro de cambiar el estado del usuario ${p.Usuario.Nombre}?`)){
                              if(mapOptionToEstado(e.target.value)==="Rechazado") return (setRechazo(true),abrirRevision(p))
                              handleChangeEstado.mutate({
                                idProc: p.id,
                                data: {
                                  Estado: mapOptionToEstado(e.target.value),
                                },
                              })
                            }
                            }
                            }
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En revisión">En revisión</option>
                            <option value="Verificado">Verificado</option>
                            <option value="Rechazado">Rechazado</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => abrirRevision(p)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border border-orange-100 text-orange-700 bg-orange-50 hover:bg-orange-100"
                          >
                            <FileText className="w-3 h-3" />
                            Revisar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Cita */}
        {showCitaModal && (
          <div className="fixed inset-0 flex items-center justify-center z-40">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={!loadingCita ? cerrarCita : undefined}
            />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-5 z-50">
              <button
                onClick={!loadingCita ? cerrarCita : undefined}
                className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {productorSel
                  ? `Agendar cita con ${
                      productorSel.Usuario?.Nombre || "productor"
                    }`
                  : "Agendar cita"}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Define la fecha, hora y propósito de la cita con el productor.
              </p>

              <form className="space-y-3" onSubmit={guardarCita}>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Fecha de la cita
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      value={citaForm.FechaCita}
                      onChange={(e) =>
                        setCitaForm((prev) => ({
                          ...prev,
                          FechaCita: e.target.value,
                        }))
                      }
                      required
                    />
                    <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Hora de la cita
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    value={citaForm.HoraCita}
                    onChange={(e) =>
                      setCitaForm((prev) => ({
                        ...prev,
                        HoraCita: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Propósito de la cita
                  </label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 min-h-[70px]"
                    placeholder="Describe brevemente el motivo de la cita..."
                    value={citaForm.PropositoCita}
                    onChange={(e) =>
                      setCitaForm((prev) => ({
                        ...prev,
                        PropositoCita: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={!loadingCita ? cerrarCita : undefined}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                    disabled={loadingCita}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                    disabled={loadingCita}
                  >
                    {loadingCita ? "Guardando..." : "Guardar cita"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Revisión */}
        {/* Modal de Revisión */}
{showRevisionModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-green-200">

      {/* Encabezado verde */}
      <div className="bg-green-50 p-4 border-b border-green-200 flex items-center gap-3">
        <div className="bg-white p-2 rounded-full shadow-sm border border-green-200">
          <FileText className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-green-800">
            Agregar observación
          </h2>
          <p className="text-xs text-green-700">
            Esta observación será guardada en el expediente del productor.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={guardarRevision}>
        <div className="p-4 space-y-3">
          <label className="block text-xs font-medium text-gray-700">
            Observaciones <span className="text-green-600">*</span>
          </label>

          <textarea
            className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm resize-none bg-green-50"
            placeholder="Escribe las observaciones o correcciones..."
            rows={4}
            value={comentarioRevision}
            onChange={(e) => setComentarioRevision(e.target.value)}
          />
        </div>

        {/* Botones */}
        <div className="p-4 bg-green-50 flex justify-end gap-3 border-t border-green-200">
          <button
            type="button"
            onClick={cerrarRevision}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm border border-green-700"
          >
            Guardar
          </button>
        </div>
      </form>

    </div>
  </div>
)}

      </main>
    </div>
  );
}
