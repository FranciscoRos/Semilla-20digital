# Documentación: Integración APIs Semilla Digital

## 📋 Índice
1. [Estructura del Cliente API](#estructura)
2. [Guía de Integración](#integración)
3. [Endpoints por Módulo](#endpoints)
4. [Ejemplo de Migración](#ejemplo)

---

## Estructura del Cliente API {#estructura}

Toda la lógica de API está centralizada en `client/services/api.ts`

### Patrón de Datos Demo + APIs

```typescript
// 1. DATOS DEMO (para desarrollo sin backend)
export const demoCursos: Curso[] = [...]

// 2. FUNCIÓN API (comentada, lista para descomentar)
// export const getCursos = async () => {
//   const response = await fetch(`${API_BASE_URL}/cursos`)
//   return response.json()
// }

// 3. USO EN COMPONENTES
import { demoCursos } from "@/services/api"
const [cursos] = useState(demoCursos)
```

---

## Guía de Integración {#integración}

### Paso 1: Configurar la URL base

En `.env.local`:
```env
VITE_API_URL=https://api.tudominio.com/api
```

### Paso 2: Descomentar función de API

En `client/services/api.ts`:

**ANTES (usando demo):**
```typescript
export const demoCursos: Curso[] = [...]
// const [cursos] = useState(demoCursos)
```

**DESPUÉS (usando API):**
```typescript
export const getCursos = async () => {
  const response = await fetch(`${API_BASE_URL}/cursos`)
  if (!response.ok) throw new Error('Error en API')
  return response.json()
}

// En componente:
// const [cursos, setCursos] = useState<Curso[]>([])
// useEffect(() => {
//   getCursos().then(setCursos)
// }, [])
```

### Paso 3: Manejar errores y loading

```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  setLoading(true)
  getCursos()
    .then(setCursos)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}, [])
```

---

## Endpoints por Módulo {#endpoints}

### 🔐 AUTENTICACIÓN

```
POST /auth/productor/login
  Body: { email: string, password: string }
  Response: { token: string, usuario: User }

POST /auth/admin/login
  Body: { email: string, password: string }
  Response: { token: string, admin: Admin }

POST /auth/productor/registrar
  Body: RegisterData
  Response: { id: number, estatus: "pendiente" }

POST /auth/recuperar-contrasena
  Body: { email: string }
  Response: { message: string }
```

### 📅 CALENDARIO AGRÍCOLA

```
GET /calendario-agricola?filtro=Maíz
  Response: CalendarioData[]

GET /calendario-agricola/mes/{mes}
  Response: CalendarioData

GET /alertas-climaticas
  Response: AlertaClimatica[]
```

### 🗺️ GEOMAPA

```
GET /geomapa/recursos?tipo=centro_acopio
  Response: RecursoGeomapa[]

POST /geomapa/recursos/reportar
  Body: { tipo: string, ubicacion: GeoJSON, descripcion: string }
  Response: { id: number, estatus: "pendiente_validacion" }

GET /geomapa/alertas-comunitarias
  Response: AlertaComunidad[]
```

### 📚 CURSOS

```
GET /cursos
  Response: Curso[]

GET /cursos?categoria=Finanzas&modalidad=online
  Response: Curso[]

GET /cursos/{id}
  Response: Curso

POST /cursos/{id}/inscribir
  Headers: { Authorization: "Bearer {token}" }
  Body: { usuario_id: number }
  Response: { inscripcion_id: number }

GET /mis-cursos
  Headers: { Authorization: "Bearer {token}" }
  Response: { inscripciones: CursoInscripcion[] }
```

### 💰 APOYOS

```
GET /apoyos
  Response: Apoyo[]

GET /apoyos/personalizados
  Headers: { Authorization: "Bearer {token}" }
  Response: Apoyo[] (filtrados por perfil)

GET /apoyos/{id}
  Response: ApoyoDetallado

POST /apoyos/{id}/aplicar
  Headers: { Authorization: "Bearer {token}" }
  Body: { datos_formulario: Record<string, any> }
  Response: { solicitud_id: number, estatus: "recibida" }

GET /mis-solicitudes
  Headers: { Authorization: "Bearer {token}" }
  Response: { solicitudes: SolicitudApoyo[] }

POST /solicitudes/{id}/evidencias
  Headers: { Authorization: "Bearer {token}" }
  Body: FormData (archivo: File)
  Response: { evidencia_id: number }
```

### 📊 TRANSPARENCIA

```
GET /transparencia/estadisticas
  Response: {
    monto_total_distribuido: number,
    beneficiarios_total: number,
    programas_activos: number
  }

GET /transparencia/por-programa/{id}
  Response: {
    monto_asignado: number,
    monto_ejercido: number,
    beneficiarios: number,
    distribucion_municipal: Record<string, number>
  }
```

### 💬 FOROS

```
GET /foros/temas
  Response: TemaPrincipal[]

GET /foros/temas/{id}/publicaciones
  Response: PublicacionForo[]

POST /foros/temas/{id}/publicaciones
  Headers: { Authorization: "Bearer {token}" }
  Body: { titulo: string, contenido: string }
  Response: { publicacion_id: number }

POST /foros/publicaciones/{id}/respuestas
  Headers: { Authorization: "Bearer {token}" }
  Body: { contenido: string }
  Response: { respuesta_id: number }

DELETE /foros/publicaciones/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { message: "Eliminado" }
```

### 🔧 ADMINISTRACIÓN

```
GET /admin/productores/pendientes
  Headers: { Authorization: "Bearer {token}", Role: "admin" }
  Response: ProductorPendiente[]

POST /admin/productores/{id}/validar
  Headers: { Authorization: "Bearer {token}", Role: "admin" }
  Body: { aprobado: boolean, motivo?: string }
  Response: { message: string }

GET /admin/solicitudes/pendientes
  Headers: { Authorization: "Bearer {token}", Role: "admin" }
  Response: SolicitudApoyo[]

POST /admin/solicitudes/{id}/procesar
  Headers: { Authorization: "Bearer {token}", Role: "admin" }
  Body: { aprobado: boolean, motivo?: string }
  Response: { message: string }

GET /admin/cursos
  Headers: { Authorization: "Bearer {token}", Role: "admin" }
  Response: Curso[]

POST /admin/cursos
  Headers: { Authorization: "Bearer {token}", Role: "admin" }
  Body: { titulo: string, descripcion: string, modalidad: string, ... }
  Response: { curso_id: number }

GET /admin/apoyos
  Headers: { Authorization: "Bearer {token}", Role: "admin" }
  Response: Apoyo[]

POST /admin/apoyos
  Headers: { Authorization: "Bearer {token}", Role: "admin" }
  Body: { nombre: string, descripcion: string, monto: number, ... }
  Response: { apoyo_id: number }
```

---

## Ejemplo de Migración {#ejemplo}

### Antes (Solo datos demo):

```typescript
// client/pages/producer/Cursos.tsx
import { demoCursos } from "@/services/api"

export default function Cursos() {
  const [cursos] = useState(demoCursos)
  
  return (
    <div>
      {cursos.map(curso => (
        <div key={curso.id}>{curso.titulo}</div>
      ))}
    </div>
  )
}
```

### Después (Conectado a Laravel):

```typescript
// client/services/api.ts
export const getCursos = async () => {
  const response = await fetch(`${API_BASE_URL}/cursos`)
  if (!response.ok) throw new Error('Error obteniendo cursos')
  return response.json()
}

// client/pages/producer/Cursos.tsx
import { getCursos, demoCursos } from "@/services/api"
import { useEffect } from "react"

export default function Cursos() {
  const [cursos, setCursos] = useState(demoCursos)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getCursos()
      .then(setCursos)
      .catch(err => {
        console.error(err)
        // Mantener datos demo en caso de error
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Cargando...</div>
  
  return (
    <div>
      {cursos.map(curso => (
        <div key={curso.id}>{curso.titulo}</div>
      ))}
    </div>
  )
}
```

---

## 🔄 Token y Autenticación

### Guardar token tras login:

```typescript
export const loginProducer = async (credentials: AuthCredentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/productor/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  const data = await response.json()
  localStorage.setItem('authToken', data.token)
  localStorage.setItem('userId', data.usuario.id)
  return data
}
```

### Usar token en peticiones autenticadas:

```typescript
export const getMisSolicitudes = async () => {
  const token = localStorage.getItem('authToken')
  const response = await fetch(`${API_BASE_URL}/mis-solicitudes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  return response.json()
}
```

---

## ⚙️ Archivo .env.local

```env
VITE_API_URL=http://localhost:8000/api
VITE_GEMINI_API_KEY=AIzaSyDk_oOKIcgeoodDFyvvb8u1h-JSN0bENOA
```

---

## 📝 Notas Importantes

- ✅ Todos los datos demo están listos para reemplazar
- ✅ Las funciones API están pre-estructuradas y comentadas
- ✅ Los headers de autenticación están incluidos
- ✅ El manejo de errores está en lugar
- ⚠️ Actualiza la URL base de API en `.env.local` cuando sea necesario

