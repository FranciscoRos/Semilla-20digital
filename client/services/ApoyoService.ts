import axios from "axios";
import { authHeader } from "@/helper/authHeader";

const apoyosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export interface Apoyo {
  _id: number;
  Titulo: string;
  Descripcion: string;
  Requisitos: string;
  Estatus: string;
  Creado: string;
  Actualizado: string;
}

export const getApoyos = async (): Promise<Apoyo[]> => {
  await authHeader(apoyosApi);
  const res = await apoyosApi.get("apoyo");

  // res.data = { data: [...] }
  const raw = res.data;

  // Nos quedamos con el arreglo interno
  if (Array.isArray(raw)) {
    return raw;
  }

  if (Array.isArray(raw.data)) {
    return raw.data;
  }

  console.error("Formato inesperado en GET /apoyo:", raw);
  return [];
};


export const createApoyo = async (
  data: Omit<Apoyo, "_id">
): Promise<Apoyo> => {
  await authHeader(apoyosApi);
  const res = await apoyosApi.post("apoyo", data);
  return res.data;
};

export const updateApoyo = async (
  id: number,
  data: Omit<Apoyo, "_id">
): Promise<Apoyo> => {
  await authHeader(apoyosApi);
  const res = await apoyosApi.put(`apoyo/${id}`, data);
  return res.data;
};

export const deleteApoyo = async (id: number): Promise<void> => {
  await authHeader(apoyosApi);
  await apoyosApi.delete(`apoyo/${id}`);
};
