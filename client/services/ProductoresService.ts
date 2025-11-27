import axios from "axios";
import { authHeader } from "@/helper/authHeader";
import type { PerfilRegistro } from "./PendientesReviService";

// Cliente Axios para PRODUCTORES REGISTRADOS
// Si VITE_API_URL = "http://127.0.0.1:8000/api/"
// entonces baseURL = "http://127.0.0.1:8000/api/registro"
const productoresApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "registro",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Helper para desenvolver { data: ... } de los JsonResource
function unwrapCollection<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

/**
 * Obtiene todos los productores registrados.
 * Por ahora no filtramos por Estado para que veas todo lo que viene de /registro.
 * Si después quieres solo "Aprobados", aquí mismo filtramos.
 */
export const getProductoresRegistrados = async (): Promise<PerfilRegistro[]> => {
  try {
    await authHeader(productoresApi);
    const res = await productoresApi.get(""); // GET /api/registro
    const lista = unwrapCollection<PerfilRegistro>(res.data);

    // 👉 Si luego quieres solo aprobados, algo como:
    // return lista.filter((p) => p.Estado === "Aprobado");

    return lista;
  } catch (error) {
    console.error("Error al obtener productores registrados:", error);
    throw error;
  }
};
