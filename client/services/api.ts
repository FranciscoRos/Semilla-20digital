/**
 * CLIENTE API SEMILLA DIGITAL
 * 
 * Este archivo centraliza todas las llamadas a la API de Laravel.
 * Reemplaza los datos demo con llamadas reales cuando el backend esté listo.
 * 
 * ESTRUCTURA DE EJEMPLO:
 * 
 * // Demo data
 * const demoCursos = [...]
 * 
 * // Función real (comentada)
 * // export const getCursos = async () => {
 * //   const response = await fetch('https://api.semilladigital.mx/api/cursos')
 * //   return response.json()
 * // }
 * 
 * // Para usar: simplemente descomenta la función real y elimina el demo
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ============================================
// AUTENTICACIÓN
// ============================================

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  curp: string;
  email: string;
  telefono: string;
  municipio: string;
  domicilio: string;
  contrasena: string;
  poligono_parcela: string; // GeoJSON
}

// TODO: Descomentar cuando Laravel esté listo
// export const loginProducer = async (credentials: AuthCredentials) => {
//   const response = await fetch(`${API_BASE_URL}/auth/productor/login`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(credentials)
//   })
//   return response.json()
// }

// ============================================
// CALENDARIO AGRÍCOLA
// ============================================

export interface CalendarioData {
  id: number;
  mes: string;
  temperatura: string;
  humedad: string;
  precipitacion: string;
  cultivos_recomendados: string[];
  riesgo_plagas: string;
  fase_lunar: string;
}

// Demo data
export const demoCalendario: CalendarioData[] = [
  {
    id: 1,
    mes: "Enero",
    temperatura: "28°C",
    humedad: "65%",
    precipitacion: "45mm",
    cultivos_recomendados: ["Maíz", "Frijol"],
    riesgo_plagas: "Bajo",
    fase_lunar: "Creciente",
  },
];

// TODO: Descomentar cuando Laravel esté listo
// export const getCalendario = async (filtro?: string) => {
//   const url = filtro ? `${API_BASE_URL}/calendario?filtro=${filtro}` : `${API_BASE_URL}/calendario`
//   const response = await fetch(url)
//   return response.json()
// }

// ============================================
// CURSOS Y CAPACITACIÓN
// ============================================

export interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  modalidad: "online" | "presencial" | "hibrida";
  categoria: string;
  fecha_inicio?: string;
  ubicacion?: string;
  enlace_plataforma?: string;
  inscritos: number;
  calificacion: number;
}

// Demo data
export const demoCursos: Curso[] = [
  {
    id: 1,
    titulo: "Gestión Financiera Agrícola",
    descripcion: "Aprende a administrar recursos financieros",
    modalidad: "online",
    categoria: "Asesoría Financiera",
    enlace_plataforma: "https://ejemplo.com",
    inscritos: 245,
    calificacion: 4.8,
  },
];

// TODO: Descomentar cuando Laravel esté listo
// export const getCursos = async () => {
//   const response = await fetch(`${API_BASE_URL}/cursos`)
//   return response.json()
// }

// export const getCursoById = async (id: number) => {
//   const response = await fetch(`${API_BASE_URL}/cursos/${id}`)
//   return response.json()
// }

// export const inscribirCurso = async (cursoId: number) => {
//   const response = await fetch(`${API_BASE_URL}/cursos/${cursoId}/inscribir`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ usuario_id: getUserId() })
//   })
//   return response.json()
// }

// ============================================
// APOYOS (PROGRAMAS)
// ============================================

export interface Apoyo {
  id: number;
  nombre: string;
  descripcion: string;
  monto: number;
  requisitos: string[];
  vigencia_inicio: string;
  vigencia_fin: string;
  estado: "activo" | "inactivo";
  beneficiarios: number;
}

// Demo data
export const demoApoyos: Apoyo[] = [
  {
    id: 1,
    nombre: "Apoyo para Siembra de Maíz",
    descripcion: "Subsidio para compra de semillas",
    monto: 15000,
    requisitos: ["Ser productor", "Menos de 5 hectáreas"],
    vigencia_inicio: "2024-01-01",
    vigencia_fin: "2024-12-31",
    estado: "activo",
    beneficiarios: 450,
  },
];

// TODO: Descomentar cuando Laravel esté listo
// export const getApoyos = async () => {
//   const response = await fetch(`${API_BASE_URL}/apoyos`)
//   return response.json()
// }

// export const getApoyosPersonalizados = async (usuarioId: number) => {
//   const response = await fetch(`${API_BASE_URL}/apoyos/personalizados/${usuarioId}`)
//   return response.json()
// }

// ============================================
// GEOMAPA
// ============================================

export interface RecursoGeomapa {
  id: number;
  nombre: string;
  tipo: string;
  latitud: number;
  longitud: number;
  detalles: Record<string, string>;
}

// Demo data
export const demoGeomapa: RecursoGeomapa[] = [
  {
    id: 1,
    nombre: "Centro de Acopio Norte",
    tipo: "centro_acopio",
    latitud: 18.5,
    longitud: -88.3,
    detalles: { horario: "8am-5pm", telefono: "9988123456" },
  },
];

// TODO: Descomentar cuando Laravel esté listo
// export const getRecursosGeomapa = async (filtros?: string[]) => {
//   const query = filtros ? `?filtros=${filtros.join(',')}` : ''
//   const response = await fetch(`${API_BASE_URL}/geomapa/recursos${query}`)
//   return response.json()
// }

// ============================================
// TRANSPARENCIA
// ============================================

export interface TransparenciaStats {
  monto_total_distribuido: number;
  beneficiarios_total: number;
  programas_activos: number;
}

// Demo data
export const demoTransparencia: TransparenciaStats = {
  monto_total_distribuido: 2400000,
  beneficiarios_total: 1247,
  programas_activos: 6,
};

// TODO: Descomentar cuando Laravel esté listo
// export const getEstadisticasTransparencia = async () => {
//   const response = await fetch(`${API_BASE_URL}/transparencia/estadisticas`)
//   return response.json()
// }

// ============================================
// FOROS
// ============================================

export interface PublicacionForo {
  id: number;
  titulo: string;
  contenido: string;
  autor: string;
  fecha_creacion: string;
  respuestas: number;
  tema_id: number;
}

// Demo data
export const demoForoPublicaciones: PublicacionForo[] = [
  {
    id: 1,
    titulo: "¿Cuándo sembrar maíz?",
    contenido: "Necesito saber el mejor tiempo...",
    autor: "Juan Pérez",
    fecha_creacion: "2024-01-15",
    respuestas: 3,
    tema_id: 1,
  },
];

// TODO: Descomentar cuando Laravel esté listo
// export const getPublicacionesForo = async (temaId: number) => {
//   const response = await fetch(`${API_BASE_URL}/foros/temas/${temaId}/publicaciones`)
//   return response.json()
// }

// ============================================
// ADMINISTRACIÓN - VALIDACIÓN
// ============================================

export interface ProductorPendiente {
  id: number;
  nombre: string;
  curp: string;
  email: string;
  estado: "pendiente" | "verificado" | "rechazado";
  fecha_registro: string;
  poligono_parcela: string; // GeoJSON
}

// Demo data
export const demoProductoresPendientes: ProductorPendiente[] = [
  {
    id: 1,
    nombre: "María Elena Vázquez",
    curp: "VXZM900101HDFRRA09",
    email: "maria@email.com",
    estado: "pendiente",
    fecha_registro: "2024-01-15",
    poligono_parcela: '{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}',
  },
];

// TODO: Descomentar cuando Laravel esté listo
// export const getProductoresPendientes = async () => {
//   const response = await fetch(`${API_BASE_URL}/admin/productores/pendientes`)
//   return response.json()
// }

// export const validarProductor = async (productoId: number, aprobado: boolean, motivo?: string) => {
//   const response = await fetch(`${API_BASE_URL}/admin/productores/${productoId}/validar`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ aprobado, motivo })
//   })
//   return response.json()
// }

// ============================================
// UTILIDADES
// ============================================

export const getUserId = (): number => {
  // Obtener del localStorage o sesión
  return parseInt(localStorage.getItem("userId") || "0");
};

export const getToken = (): string => {
  return localStorage.getItem("authToken") || "";
};
