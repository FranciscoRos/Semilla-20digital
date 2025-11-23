import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPerfilesPendientes,
  getPerfilRegistro,
  aprobarPerfilRegistro,
  rechazarPerfilRegistro,
  PerfilRegistro,
} from "@/services/PendientesReviService";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  User,
  Home,
  FileText,
} from "lucide-react";

export default function UsuariosRevision() {
  const navigate = useNavigate();

  const [pendientes, setPendientes] = useState<PerfilRegistro[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPerfil, setSelectedPerfil] = useState<PerfilRegistro | null>(
    null
  );
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // Cargar lista de pendientes al entrar
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

  // Cargar detalle cuando cambia selectedId
  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedId) {
        setSelectedPerfil(null);
        return;
      }
      setLoadingDetail(true);
      try {
        const data = await getPerfilRegistro(selectedId);
        setSelectedPerfil(data);
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoadingDetail(false);
      }
    };
    loadDetail();
  }, [selectedId]);

  const handleApprove = async () => {
    if (!selectedPerfil) return;
    try {
      await aprobarPerfilRegistro(selectedPerfil.id);
      setPendientes((prev) => prev.filter((p) => p.id !== selectedPerfil.id));
      setSelectedPerfil(null);
      setSelectedId(null);
      setMotivoRechazo("");
    } catch (err) {
      console.error("Error aprobando perfil:", err);
    }
  };

  const handleReject = async () => {
    if (!selectedPerfil) return;
    if (!motivoRechazo.trim()) {
      alert("Escribe un motivo de rechazo.");
      return;
    }
    try {
      await rechazarPerfilRegistro(selectedPerfil.id, motivoRechazo);
      setPendientes((prev) => prev.filter((p) => p.id !== selectedPerfil.id));
      setSelectedPerfil(null);
      setSelectedId(null);
      setMotivoRechazo("");
    } catch (err) {
      console.error("Error rechazando perfil:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-full border p-1 hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Pendientes de revisión
          </h1>
          <p className="text-sm text-gray-500">
            Selecciona un productor para revisar su información y aprobar o
            rechazar su registro.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[260px,1fr] gap-4">
        {/* Lista de pendientes */}
        <aside className="bg-white rounded-2xl shadow p-4 h-[70vh] overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Productores pendientes
          </h2>

          {loadingList && (
            <p className="text-xs text-gray-500">Cargando lista…</p>
          )}

          {!loadingList && pendientes.length === 0 && (
            <p className="text-xs text-gray-500">
              No hay productores pendientes de revisión.
            </p>
          )}

          <div className="space-y-2">
            {pendientes.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${
                  selectedId === p.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-gray-800">
                  {p.Usuario.Nombre} {p.Usuario.Apellido1} {p.Usuario.Apellido2}
                </div>
                <div className="text-[11px] text-gray-500">
                  {p.Usuario.Correo} · {p.Usuario.Telefono}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Detalle */}
        <main className="bg-white rounded-2xl shadow p-6 h-[70vh] overflow-y-auto">
          {loadingDetail && (
            <p className="text-sm text-gray-500">Cargando detalle…</p>
          )}

          {!loadingDetail && !selectedPerfil && (
            <p className="text-sm text-gray-500">
              Selecciona un productor de la lista para revisar su información.
            </p>
          )}

          {selectedPerfil && (
            <>
              {/* Información básica */}
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Información básica
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-600">Nombre</div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Nombre}{" "}
                      {selectedPerfil.Usuario.Apellido1}{" "}
                      {selectedPerfil.Usuario.Apellido2}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">CURP</div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Curp}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Correo</div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Correo}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Teléfono</div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Telefono}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">
                      Fecha de nacimiento
                    </div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.FechaNacimiento}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">RFC</div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Rfc}
                    </div>
                  </div>
                </div>
              </section>

              {/* Domicilio */}
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Domicilio
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-600">Calle</div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Domicilio.Calle}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Colonia</div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Domicilio.Colonia}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Municipio</div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Domicilio.Municipio}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Ciudad</div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Domicilio.Ciudad}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Estado</div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Domicilio.Estado}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">
                      Código Postal
                    </div>
                    <div className="text-gray-900">
                      {selectedPerfil.Usuario.Domicilio.CodigoPostal}
                    </div>
                  </div>
                </div>
              </section>

              {/* Revisión admin */}
              <section className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Revisión del administrador
                  </h2>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de rechazo (opcional si apruebas, obligatorio si
                  rechazas)
                </label>
                <textarea
                  rows={3}
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 text-sm"
                  placeholder="Describe aquí el motivo en caso de rechazar el registro…"
                />

                <div className="flex flex-wrap gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleReject}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprobar
                  </button>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
