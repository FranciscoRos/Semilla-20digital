import axios from "axios";
import { authHeader } from "@/helper/authHeader";

const cursosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ej. http://127.0.0.1:8000/api
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export interface Curso {
  id: string;
  Titulo: string;
  Descripcion: string;
  Detalles: string;
  Tema: string;
  Modalidad: "online" | "presencial";
  FechaCurso: string[];
  DireccionUbicacion: string;
  Latitud: number;
  Longitud: number;
  Url: string;
}

// Para crear/editar no mandamos el _id
export type CursoPayload = Omit<Curso, "id">;

// ======================
// CRUD
// ======================

// GET /cursos
export const getCursos = async (): Promise<Curso[]> => {
  await authHeader(cursosApi);
  const res = await cursosApi.get("cursos");
  console.log(res);

  const raw = res.data;
  // Si Laravel responde { data: [...] }
  const items = Array.isArray(raw.data) ? raw.data : raw;

  return items as Curso[];
};

// POST /cursos
export const createCurso = async (
  data: CursoPayload
): Promise<Curso> => {
  await authHeader(cursosApi);
  const res = await cursosApi.post("cursos", data);

  const item = res.data.data ?? res.data;
  return item as Curso;
};

// PUT /cursos/{id}
export const updateCurso = async (
  id: string,
  data: CursoPayload
): Promise<Curso> => {
  await authHeader(cursosApi);
  const res = await cursosApi.put(`cursos/${id}`, data);

  const item = res.data.data ?? res.data;
  return item as Curso;
};

// DELETE /cursos/{id}
export const deleteCurso = async (id: string): Promise<void> => {
  await authHeader(cursosApi);
  await cursosApi.delete(`cursos/${id}`);
};
