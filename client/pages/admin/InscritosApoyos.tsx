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
import { getApoyos, updateApoyo, Apoyo } from "@/services/ApoyoService";
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

  const getNombreUsuario = (persona: any) => {
    const u = persona.Usuario;
    if (!u) return "Nombre no disponible";
    if (typeof u === "string") return u;
    const { Nombre, Apellido1, Apellido2 } = u;
    return [Nombre, Apellido1, Apellido2].filter(Boolean).join(" ");
  };

  const getDescripcionParcela = (persona: any): string => {
    const parc = persona.parcela;
    if (!parc) return "N/D";
    if (typeof parc === "string") return parc;

    if (Array.isArray(parc)) {
      return parc
        .map(
          (p) =>
            p.nombre ||
            `${p.ciudad ?? ""} ${p.municipio ?? ""}`.trim() ||
            `Parcela ${p.idParcela ?? ""}`
        )
        .join(", ");
    }

    return (
      parc.nombre ||
      `${parc.ciudad ?? ""} ${parc.municipio ?? ""}`.trim() ||
      `Parcela ${parc.idParcela ?? ""}` ||
      "Parcela registrada"
    );
  };

  const totalInscritos = inscritos.length;
  const totalConCita = inscritos.filter((i) => i.agendacionCita).length;

  const filteredInscritos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return inscritos.filter((p) => {
      const cita = p.agendacionCita;
      const tieneCita = !!cita;

      if (filtroEstado === "con_cita" && !tieneCita) return false;
      if (filtroEstado === "sin_cita" && tieneCita) return false;

      if (!term) return true;

      const nombre = getNombreUsuario(p).toLowerCase();
      const curp =
        (p.Usuario && p.Usuario.Curp ? p.Usuario.Curp : p.curp || "") + "";
      const parcela = getDescripcionParcela(p).toLowerCase();
      const ubicacion = (p.ubicacion || "").toLowerCase();

      return (
        nombre.includes(term) ||
        curp.toLowerCase().includes(term) ||
        parcela.includes(term) ||
        ubicacion.includes(term)
      );
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
    setShowCitaModal(true);
  };

  const cerrarCita = () => {
    setInscritoSel(null);
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

      // 1) Actualizar en estado local
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

      // 2) Construir Beneficiados en formato que espera el back
      const beneficiadosForBackend = nuevosInscritos
        .map((b: any) => {
          const u = b.Usuario;
          const parc = b.parcela;

          const usuarioId =
            typeof u === "string" ? u : u?.idUsuario ?? undefined;
          const parcelaId =
            typeof parc === "string" ? parc : parc?.idParcela ?? undefined;

          if (!usuarioId || !parcelaId) {
            return null; // evitamos romper el validador con datos incompletos
          }

          const ag = b.agendacionCita || {};

          const tieneCita =
            ag.FechaCita || ag.HoraCita || ag.PropositoCita || ag.Administrador;

          return {
            Usuario: usuarioId,
            parcela: parcelaId,
            fechaRegistro: b.fechaRegistro ?? undefined,
            ...(tieneCita && {
              agendacionCita: {
                Administrador: null, // por ahora no mandamos ID real para evitar errores de ObjectId
                FechaCita: ag.FechaCita || citaForm.FechaCita || null,
                HoraCita: ag.HoraCita || citaForm.HoraCita || null,
                PropositoCita:
                  ag.PropositoCita || citaForm.PropositoCita || null,
              },
            }),
          };
        })
        .filter(Boolean) as any[];

      // 3) Payload completo como en GestionApoyos
      const payload: any = {
        nombre_programa: (apoyo as any).nombre_programa,
        descripcion: (apoyo as any).descripcion,
        objetivo: (apoyo as any).objetivo,
        tipo_objetivo: (apoyo as any).tipo_objetivo,
        fechaInicio: (apoyo as any).fechaInicio,
        fechaFin: (apoyo as any).fechaFin,

        institucion_encargada: (apoyo as any).institucion_encargada,
        institucion_acronimo: (apoyo as any).institucion_acronimo,
        direccion: (apoyo as any).direccion,
        horarios_atencion: (apoyo as any).horarios_atencion,
        telefono_contacto: (apoyo as any).telefono_contacto,
        correo_contacto: (apoyo as any).correo_contacto,
        redes_sociales: (apoyo as any).redes_sociales,
        latitud_institucion: (apoyo as any).latitud_institucion,
        longitud_institucion: (apoyo as any).longitud_institucion,

        Requerimientos: (apoyo as any).Requerimientos ?? [],
        numero_beneficiados_actual: beneficiadosForBackend.length,
        Beneficiados: beneficiadosForBackend,
      };

      const apoyoId = (apoyo as any).id;
      console.log("ID usado en updateApoyo:", apoyoId);
      console.log("Payload que se enviará a updateApoyo:", payload);

      await updateApoyo(String(apoyoId), payload);

      cerrarCita();
    } catch (err: any) {
      console.error("Error guardando cita:", err);
      console.log("Respuesta del backend:", err?.response?.data);
      alert("Hubo un error al guardar la cita. Revisa la consola.");
    } finally {
      setSavingCita(false);
    }
  };

  if (loading) return <LoadingSDloading />;

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
        <ChevronLeft className="w-4 h-4 mr-1" /> Volver a gestión de apoyos
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Inscritos en: {apoyo.nombre_programa}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Vigencia: {apoyo.fechaInicio} — {apoyo.fechaFin}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-xl bg-gray-50">
          <p className="text-xs text-gray-500">Total inscritos</p>
          <p className="text-xl font-bold">{totalInscritos}</p>
        </div>
        <div className="p-4 border rounded-xl bg-green-50">
          <p className="text-xs text-green-700">Con cita</p>
          <p className="text-xl font-bold text-green-800">{totalConCita}</p>
        </div>
        <div className="p-4 border rounded-xl bg-yellow-50">
          <p className="text-xs text-yellow-700">Sin cita</p>
          <p className="text-xl font-bold text-yellow-800">
            {totalInscritos - totalConCita}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, CURP, parcela o ubicación..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setFiltroEstado("todos")}
            className={`px-3 py-1.5 text-xs rounded-full border ${
              filtroEstado === "todos"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado("con_cita")}
            className={`px-3 py-1.5 text-xs rounded-full border ${
              filtroEstado === "con_cita"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            Con cita
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado("sin_cita")}
            className={`px-3 py-1.5 text-xs rounded-full border ${
              filtroEstado === "sin_cita"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            Sin cita
          </button>
        </div>
      </div>

      {filteredInscritos.length === 0 ? (
        <div className="p-12 text-center text-gray-500 border border-dashed rounded-xl bg-white">
          No hay personas inscritas que coincidan con los filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInscritos.map((p, i) => {
            const cita = p.agendacionCita;

            return (
              <div
                key={i}
                className="bg-white p-4 border rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {getNombreUsuario(p)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Parcela: {getDescripcionParcela(p)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${
                      cita
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {cita ? "Con cita" : "Sin cita"}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>
                      Registro: {p.fechaRegistro || "No disponible"}
                    </span>
                  </div>

                  {p.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{p.ubicacion}</span>
                    </div>
                  )}

                  {cita && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-[11px] font-semibold text-green-800">
                        Detalles de la cita
                      </p>
                      <p className="text-[11px]">
                        <strong>Fecha:</strong> {cita.FechaCita}
                      </p>
                      <p className="text-[11px]">
                        <strong>Hora:</strong> {cita.HoraCita}
                      </p>
                      <p className="text-[11px]">
                        <strong>Propósito:</strong> {cita.PropositoCita}
                      </p>
                      {cita.Administrador && (
                        <p className="text-[11px]">
                          <strong>Administrador:</strong>{" "}
                          {typeof cita.Administrador === "string"
                            ? cita.Administrador
                            : cita.Administrador?.Nombre || "Administrador"}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => abrirCita(p)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {cita ? "Editar cita" : "Agendar cita"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCitaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={guardarCita}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative"
          >
            <button
              type="button"
              onClick={cerrarCita}
              className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-4">
              Cita para {inscritoSel ? getNombreUsuario(inscritoSel) : ""}
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Fecha</label>
                  <input
                    type="date"
                    required
                    className="w-full border rounded-lg p-2 text-sm"
                    value={citaForm.FechaCita}
                    onChange={(e) =>
                      setCitaForm({ ...citaForm, FechaCita: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Hora</label>
                  <input
                    type="time"
                    required
                    className="w-full border rounded-lg p-2 text-sm"
                    value={citaForm.HoraCita}
                    onChange={(e) =>
                      setCitaForm({ ...citaForm, HoraCita: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Propósito</label>
                <textarea
                  rows={2}
                  required
                  className="w-full border rounded-lg p-2 text-sm"
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
                <label className="text-xs font-semibold">
                  Administrador (solo vista)
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 text-sm"
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
                onClick={cerrarCita}
                className="px-4 py-2 text-xs bg-gray-100 rounded-lg"
                disabled={savingCita}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-60"
                disabled={savingCita}
              >
                {savingCita ? "Guardando..." : "Guardar cita"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
