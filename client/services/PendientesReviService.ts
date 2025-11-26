import axios from "axios";
import { authHeader } from "@/helper/authHeader";

// === Tipos basados en PerfilRegistroResource del backend ===

export interface Domicilio {
  Calle: string | null;
  Colonia: string | null;
  Municipio: string | null;
  Ciudad: string | null;
  Estado: string | null;
  CodigoPostal: string | null;
  Referencia?: string | null;
}

export interface ParcelaUso {
  area: string | null;
  actividadesEspecificas: string[];
}

export interface ParcelaCoordenada {
  lat: number | null;
  lng: number | null;
}

export interface Parcela {
  idParcela: string | null;
  ciudad: string | null;
  municipio: string | null;
  localidad: string | null;
  direccionAdicional: string | null;
  coordenadas: ParcelaCoordenada[];
  area: string | null;
  nombre: string | null;
  usos: ParcelaUso[];
  fechaRegistro: string | null;
}

export interface UsuarioRegistro {
  idUsuario: string;
  Nombre: string | null;
  Apellido1: string | null;
  Apellido2: string | null;
  Curp: string | null;
  Correo: string | null;
  Telefono: string | null;
  FechaNacimiento: string | null;
  Ine: string | null;
  Rfc: string | null;
  Domicilio: Domicilio;
  Parcela: Parcela[];
  Revision:       Revision;
  agendacionCita: AgendacionCita;
}


export interface Revision {
  Administrador:       Administrador;
  FechaRevision:       string;
  ComentariosRevision: string;
}

export interface Administrador {
  idAdministrador: string;
  Nombre:          string;
  Apellido1:       string;
  Apellido2:       string;
  Correo:          string;
}

export interface AgendacionCita {
  Administrador: Administrador;
  FechaCita:     string;
  HoraCita:      string;
  PropositoCita: string;
}


export interface PerfilRegistro {
  id: string;
  Estado: string;
  Usuario: UsuarioRegistro;
  FechaRevision: string | null;
  FechaRevisado: string | null;
  // Campos dinámicos (CamposExtra) y otros:
  [key: string]: any;
}

// === Cliente Axios para PERFIL REGISTRO ===
// Si VITE_API_URL = "http://127.0.0.1:8000/api/"
// entonces baseURL = "http://127.0.0.1:8000/api/registro"
const pendientesApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "registro",
  headers: {
    Accept: "application/json",
  },
});

// Helper para desenvolver { data: ... } de los JsonResource
function unwrapCollection<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

function unwrapResource<T>(raw: any): T {
  if (raw && raw.data) return raw.data as T;
  return raw as T;
}

// === Servicios ===

// Lista de todos los perfiles de registro (solo pendientes)
export const getPerfilesPendientes = async (): Promise<PerfilRegistro[]> => {
  try {
    await authHeader(pendientesApi);
    const res = await pendientesApi.get(""); // GET /api/registro
    const lista = unwrapCollection<PerfilRegistro>(res.data);
    return lista.filter((p) => p.Estado === "Pendiente");
  } catch (error) {
    console.error("Error al obtener perfiles pendientes:", error);
    throw error;
  }
};

export const getPerfilRegistro = async (
  id: string
): Promise<PerfilRegistro> => {
  try {
    await authHeader(pendientesApi);
    const res = await pendientesApi.get(`/${id}`); // GET /api/registro/{id}
    const perfil = unwrapResource<PerfilRegistro>(res.data);
    return perfil;
  } catch (error) {
    console.error("Error al obtener perfil de registro:", error);
    throw error;
  }
};

export const aprobarPerfilRegistro = async (id: string): Promise<void> => {
  try {
    await authHeader(pendientesApi);
    await pendientesApi.put(`/${id}`, {
      Estado: "Verificado",
    });
  } catch (error) {
    console.error("Error al aprobar perfil de registro:", error);
    throw error;
  }
};

export const rechazarPerfilRegistro = async (
  id: string,
  motivo: string
): Promise<void> => {
  try {
    await authHeader(pendientesApi);
    await pendientesApi.put(`/${id}`, {
      Estado: "Rechazado",
      MotivoRechazo: motivo, // se guardará como campo dinámico
    });
  } catch (error) {
    console.error("Error al rechazar perfil de registro:", error);
    throw error;
  }
};

export const agregarComentario = async (
  id: string,
  idAdministrador: string,
  motivo: string
): Promise<void> => {
  try {
    await authHeader(pendientesApi);
    await pendientesApi.put(`/${id}`, {
      idAdministrador: idAdministrador,
      MotivoRechazo: motivo, 
    });
  } catch (error) {
    console.error("Error al rechazar perfil de registro:", error);
    throw error;
  }
};
