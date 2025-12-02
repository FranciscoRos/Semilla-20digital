import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  MapPin,
  Search,
  User,
  X,
} from "lucide-react";
import { getApoyos, Apoyo, agendarCitaApoyo } from "@/services/ApoyoService";
import { getPerfilesRegistro, PerfilRegistro } from "@/services/PendientesReviService";
import { useRevisionRegistro } from "@/hooks/useRevisionRegistro";
import LoadingSDloading from "@/components/loadingSDloading";

interface CitaForm {
  FechaCita: string;
  HoraCita: string;
  PropositoCita: string;
  Administrador: string;
}

type FiltroEstado = "todos" | "con_cita" | "sin_cita";

export default function InscritosApoyos() {
  const { idApoyo } = useParams<{ idApoyo: string }>();
  const navigate = useNavigate();

  const [apoyo, setApoyo] = useState<Apoyo | null>(null);
  const [inscritos, setInscritos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");

  const [showCitaModal, setShowCitaModal] = useState(false);
  const [inscritoSel, setInscritoSel] = useState<any | null>(null);
  const [savingCita, setSavingCita] = useState(false);

  const [perfilesRegistro, setPerfilesRegistro] = useState<PerfilRegistro[]>([]);
  const [loadingPerfiles, setLoadingPerfiles] = useState(false);
  const [perfilRegistroIdSel, setPerfilRegistroIdSel] = useState<string | null>(
    null
  );

  const { handleCitaProductor } = useRevisionRegistro();

  const [citaForm, setCitaForm] = useState<CitaForm>({
    FechaCita: "",
    HoraCita: "",
    PropositoCita: "",
    Administrador: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        if (!idApoyo) {
          setLoading(false);
          return;
        }
        const all = await getApoyos();
        const ap = all.find((a: any) => a.id === idApoyo) as Apoyo | undefined;

        if (ap) {
          setApoyo(ap);
          setInscritos((ap as any).Beneficiados ?? []);
        } else {
          setApoyo(null);
          setInscritos([]);
        }
      } catch (e) {
        console.error("Error cargando inscritos:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idApoyo]);

  // Cargar todos los perfiles de registro para poder mapear Usuario.idUsuario -> PerfilRegistro.id
  useEffect(() => {
    const loadPerfiles = async () => {
      try {
        setLoadingPerfiles(true);
        const lista = await getPerfilesRegistro();
        setPerfilesRegistro(lista);
      } catch (error) {
        console.error("Error cargando perfiles de registro:", error);
      } finally {
        setLoadingPerfiles(false);
      }
    };
    loadPerfiles();
  }, []);

  const getNombreUsuario = (persona: any) => {
    const u = persona.Usuario;
    if (!u) return "Nombre no disponible";
    if (typeof u === "string") return u;
    const { Nombre, Apellido1, Apellido2 } = u;
    return [Nombre, Apellido1, Apellido2].filter(Boolean).join(" ");
  };

  const getDescripcionParcela = (persona: any): string => {
    const parc = persona.parcela;
    if (!parc) return "Parcela no especificada";

    if (typeof parc === "string") {
      return `Parcela ${parc}`;
    }

    const partes: string[] = [];
    if (parc.nombre) partes.push(parc.nombre);
    if (parc.localidad) partes.push(parc.localidad);
    if (parc.municipio) partes.push(parc.municipio);
    if (parc.ciudad) partes.push(parc.ciudad);

    const base = partes.join(", ");
    return base || "Parcela registrada";
  };

  const getPerfilRegistroId = (persona: any): string | null => {
    const u = persona.Usuario;
    const idUsuario = typeof u === "string" ? u : u?.idUsuario;
    if (!idUsuario) return null;
    const perfil = perfilesRegistro.find(
      (p) => (p as any).Usuario?.idUsuario === idUsuario
    );
    return perfil ? (perfil as any).id : null;
  };

  const totalInscritos = inscritos.length;
  const totalConCita = inscritos.filter((i) => i.agendacionCita).length;

  const filteredInscritos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return inscritos.filter((p) => {
      const nombre = getNombreUsuario(p).toLowerCase();
      const parcelaStr = getDescripcionParcela(p).toLowerCase();

      const matchesSearch =
        !term ||
        nombre.includes(term) ||
        parcelaStr.includes(term) ||
        (p.Usuario?.Curp || "").toLowerCase().includes(term);

      if (!matchesSearch) return false;

      const cita = p.agendacionCita;
      const tieneCita = !!cita;

      if (filtroEstado === "con_cita") return tieneCita;
      if (filtroEstado === "sin_cita") return !tieneCita;
      return true;
    });
  }, [inscritos, searchTerm, filtroEstado]);

  const abrirCita = (persona: any) => {
    setInscritoSel(persona);
    const c = persona.agendacionCita || {};
    setCitaForm({
      FechaCita: c.FechaCita || "",
      HoraCita: c.HoraCita || "",
      PropositoCita: c.PropositoCita || "",
      Administrador:
        typeof c.Administrador === "string"
          ? c.Administrador
          : c.Administrador?.idAdministrador || "",
    });

    const perfilId = getPerfilRegistroId(persona);
    setPerfilRegistroIdSel(perfilId ?? null);

    setShowCitaModal(true);
  };

  const cerrarCita = () => {
    setInscritoSel(null);
    setPerfilRegistroIdSel(null);
    setShowCitaModal(false);
    setCitaForm({
      FechaCita: "",
      HoraCita: "",
      PropositoCita: "",
      Administrador: "",
    });
  };

  const guardarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inscritoSel || !apoyo) return;

    try {
      setSavingCita(true);

      // 1) Actualizar en estado local (UI)
      const nuevosInscritos = inscritos.map((p) =>
        p === inscritoSel
          ? {
              ...p,
              agendacionCita: {
                ...(p.agendacionCita || {}),
                FechaCita: citaForm.FechaCita,
                HoraCita: citaForm.HoraCita,
                PropositoCita: citaForm.PropositoCita,
                Administrador: citaForm.Administrador,
              },
            }
          : p
      );

      setInscritos(nuevosInscritos);
      setApoyo((prev) =>
        prev ? ({ ...prev, Beneficiados: nuevosInscritos } as any) : prev
      );

      // 2) Agendar cita también en el perfil de registro (si existe)
      const perfilId =
        perfilRegistroIdSel ?? getPerfilRegistroId(inscritoSel);

      if (perfilId) {
        handleCitaProductor.mutate({
          idProc: perfilId,
          data: {
            FechaCita: new Date(citaForm.FechaCita),
            HoraCita: citaForm.HoraCita,
            PropositoCita: citaForm.PropositoCita,
          },
        });
      } else {
        console.warn(
          "No se encontró PerfilRegistro para este beneficiado; solo se agenda la cita en el apoyo."
        );
      }

      // 3) Llamar al endpoint dedicado del apoyo para guardar la cita del beneficiado
      const usuarioId =
        typeof inscritoSel.Usuario === "string"
          ? inscritoSel.Usuario
          : inscritoSel.Usuario?.idUsuario;

      if (!usuarioId) {
        console.warn(
          "El beneficiado no tiene idUsuario; no se puede llamar a /apoyo/agendarCita."
        );
      } else {
        await agendarCitaApoyo({
          idApoyo: (apoyo as any).id,
          idUsuario: usuarioId,
          FechaCita: citaForm.FechaCita,
          HoraCita: citaForm.HoraCita,
          PropositoCita: citaForm.PropositoCita,
        });
      }

      cerrarCita();
    } catch (err: any) {
      console.error("Error guardando cita:", err);
      console.log("Respuesta del backend:", err?.response?.data);
      alert("Hubo un error al guardar la cita. Revisa la consola.");
    } finally {
      setSavingCita(false);
    }
  };

  if (loading || loadingPerfiles) return <LoadingSDloading />;

  if (!apoyo) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/admin/gestion-apoyos")}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Volver
        </button>
        <p className="text-gray-700">
          No se encontró información del apoyo seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate("/admin/gestion-apoyos")}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Volver
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Beneficiados del apoyo
        </h1>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">{apoyo.nombre_programa}</span>
        </p>
        <p className="text-xs text-gray-500">
          {totalInscritos} inscritos · {totalConCita} con cita agendada
        </p>
      </div>

      {/* Filtros y buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, CURP o ubicación de parcela..."
            className="w-full text-sm outline-none bg-transparent placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Filtrar:</span>
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`px-3 py-1.5 text-xs rounded-full border ${
              filtroEstado === "todos"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroEstado("con_cita")}
            className={`px-3 py-1.5 text-xs rounded-full border ${
              filtroEstado === "con_cita"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            Con cita
          </button>
          <button
            onClick={() => setFiltroEstado("sin_cita")}
            className={`px-3 py-1.5 text-xs rounded-full border ${
              filtroEstado === "sin_cita"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            Sin cita
          </button>
        </div>
      </div>

      {/* Lista de inscritos */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px  -4 py-3 flex items-center justify-between bg-gray-50">
          <h2 className="text-sm font-medium text-gray-800">
            Productores inscritos
          </h2>
          <span className="text-xs text-gray-500">
            Mostrando {filteredInscritos.length} registros
          </span>
        </div>

        {filteredInscritos.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No hay productores que coincidan con el criterio de búsqueda / filtros.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredInscritos.map((p, i) => {
              const cita = p.agendacionCita || {};
              const tieneCita =
                cita.FechaCita || cita.HoraCita || cita.PropositoCita;

              return (
                <div
                  key={i}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-gray-50"
                >
                  <div className="flex-1 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {getNombreUsuario(p)}
                        {tieneCita && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            <Calendar className="w-3 h-3 mr-1" />
                            Cita agendada
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        <span>{getDescripcionParcela(p)}</span>
                      </p>
                      {tieneCita && (
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Cita:</span>{" "}
                          {cita.FechaCita || "Fecha no definida"} ·{" "}
                          {cita.HoraCita || "Hora no definida"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => abrirCita(p)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {tieneCita ? "Editar cita" : "Agendar cita"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de cita */}
      {showCitaModal && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={!savingCita ? cerrarCita : undefined}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-5 z-50">
            <button
              onClick={!savingCita ? cerrarCita : undefined}
              className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {inscritoSel
                ? `Agendar cita con ${getNombreUsuario(inscritoSel)}`
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
                  onClick={!savingCita ? cerrarCita : undefined}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                  disabled={savingCita}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                  disabled={savingCita}
                >
                  {savingCita ? "Guardando..." : "Guardar cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
