import axios from "axios";
import { authHeader } from "@/helper/authHeader";

const apoyosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export interface Requisito {
  descripcion: string;
  // si en un futuro le agregas más campos, se pueden añadir aquí
  [key: string]: any;
}

// Debe coincidir con ApoyoResource.php
export interface Apoyo {
  id:string;
  nombre_programa: string;
  descripcion: string;
  objetivo: string;
  tipo_objetivo: string;

  institucion_encargada: string;
  institucion_acronimo: string;
  direccion: string;
  horarios_atencion: string;

  telefono_contacto: string;
  correo_contacto: string;
  redes_sociales: string;

  latitud_institucion: number;
  longitud_institucion: number;

  fechaInicio: string; // Y-m-d
  fechaFin: string;    // Y-m-d

  numero_beneficiados_actual: number;
  duracion:number
  Requerimientos?: Requisito[];
  Beneficiados?: any[];
}


// Payload para crear/editar (sin id)
export type ApoyoPayload = Omit<Partial<Apoyo>, "id">;

// ======================
// CRUD
// ======================

// GET /apoyo
export const getApoyos = async (): Promise<Apoyo[]> => {
  await authHeader(apoyosApi);
  const res = await apoyosApi.get("apoyo");

  const raw = res.data;
  // Laravel Resource::collection suele devolver { data: [...] }
  const items = Array.isArray(raw?.data) ? raw.data : raw;

  return items as Apoyo[];
};

// POST /apoyo
export const createApoyo = async (
  data: ApoyoPayload
): Promise<void> => {
  await authHeader(apoyosApi);
  await apoyosApi.post("apoyo", data);
};

// PUT /apoyo/{id}
export const updateApoyo = async (
  id: string,
  data: Partial<ApoyoPayload>
): Promise<Apoyo | null> => {
  await authHeader(apoyosApi);
  const res = await apoyosApi.put(`apoyo/${id}`, data);

  if (res.data && res.data.apoyo) {
    return res.data.apoyo as Apoyo;
  }

  if (res.data && res.data.data) {
    return res.data.data as Apoyo;
  }

  console.warn("Respuesta inesperada en PUT /apoyo/{id}:", res.data);
  return null;
};


export interface AgendarCitaApoyoPayload {
  idApoyo: string;
  idUsuario: string;
  FechaCita: string; // formato YYYY-MM-DD
  HoraCita: string;
  PropositoCita: string;
}

// POST /apoyo/agendarCita
export const agendarCitaApoyo = async (
  payload: AgendarCitaApoyoPayload
): Promise<any> => {
  await authHeader(apoyosApi);
  const res = await apoyosApi.post("apoyo/agendarCita", payload);
  return res.data;
};




// DELETE /apoyo/{id}
export const deleteApoyo = async (id: string): Promise<void> => {
  await authHeader(apoyosApi);
  await apoyosApi.delete(`apoyo/${id}`);
};


export async function getApoyoById(id: string): Promise<Apoyo> {
  const res = await axios.get(`apoyo/${id}`);
  return res.data;
}