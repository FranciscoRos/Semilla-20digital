# Semilla Digital Q. Roo - Guía Completa

## 📱 Descripción General

Semilla Digital es una plataforma web y móvil (Android 9+) diseñada para conectar a productores agrícolas de Quintana Roo con recursos institucionales, conocimiento técnico y apoyos financieros de manera transparente y eficiente.

**Stack Tecnológico:**

- Frontend: React 18 + TypeScript + Vite + TailwindCSS
- Backend: Laravel (a ser implementado)
- Chatbot: Google Gemini
- Mapas: Leaflet/Google Maps (integrable)

---

## 🎯 Estructura de la Aplicación

### Autenticación

- **`/login-productor`** - Login para productores
- **`/login-admin`** - Login para administradores
- **`/registro-productor`** - Registro de nuevos productores

### Módulos de Productor (7 módulos)

1. **Calendario Agrícola** - `/calendario-agricola`
   - Pronóstico del tiempo
   - Ciclos de cultivos
   - Alertas climáticas
   - Ciclos lunares

2. **Geomapa de Recursos** - `/geomapa`
   - Visualización de recursos
   - Puntos de interés
   - Alertas comunitarias
   - Zonas de riesgo

3. **Solicitar Apoyos** - `/solicitar-apoyos`
   - Listado de programas disponibles
   - Sugerencias personalizadas
   - Seguimiento de solicitudes
   - Carga de evidencias

4. **Cursos y Capacitación** - `/cursos-capacitacion`
   - Listado filtrable de cursos
   - Modalidades: online y presencial
   - Inscripción
   - Calificaciones

5. **Foros de Discusión** - `/foros-discusion`
   - Temas y subtemas
   - Publicaciones y respuestas
   - Adjuntos (fotos/videos)
   - Moderación

6. **Panel de Transparencia** - `/panel-transparencia`
   - Estadísticas generales
   - Detalles por programa
   - Distribución municipal
   - Gráficas de ejercicio presupuestario

7. **Dashboard Principal** - `/producer-dashboard`
   - Resumen de servicios
   - Notificaciones
   - Estado del perfil

### Módulos de Administrador (6 módulos)

1. **Validación de Productores** - `/admin/validacion-productores`
   - Revisión de registros pendientes
   - Visualización de polígonos de parcela
   - Aprobación/Rechazo

2. **Validación de Solicitudes** - `/admin/validacion-solicitudes`
   - Cola de solicitudes de apoyo
   - Revisión de documentos
   - Aprobación/Rechazo

3. **Gestión de Cursos** - `/admin/gestion-cursos`
   - CRUD de cursos
   - Definición de modalidades
   - Asociación de ubicaciones

4. **Gestión de Apoyos** - `/admin/gestion-apoyos`
   - CRUD de programas
   - Definición de requisitos
   - Construcci��n de formularios dinámicos

5. **Moderación de Foros** - `/admin/moderacion-foros`
   - Revisión de publicaciones
   - Eliminación de contenido
   - Suspensión de usuarios

6. **Dashboard Administrativo** - `/admin-panel`
   - Estadísticas generales
   - Acceso a todos los módulos
   - Actividad reciente

---

## 🚀 Cómo Empezar

### 1. Instalación Local

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Abrir en navegador
# http://localhost:8080
```

### 2. Acceder a la Aplicación

**Como Productor:**

- Ir a: `/login-productor`
- Registrarse en: `/registro-productor`

**Como Administrador:**

- Ir a: `/login-admin`

### 3. Datos Demo

Todos los datos demo están en `client/services/api.ts`:

- `demoCursos` - Cursos de ejemplo
- `demoApoyos` - Programas de apoyo
- `demoGeomapa` - Recursos en mapa
- `demoForoPublicaciones` - Publicaciones de foros
- `demoProductoresPendientes` - Productores para validar
- `demoTransparencia` - Estadísticas

---

## 🔌 Integración con APIs de Laravel

### Estructura de Integración

**Archivo Principal:** `client/services/api.ts`

```typescript
// Paso 1: Definir tipos
export interface Curso {
  id: number
  titulo: string
  // ...
}

// Paso 2: Datos demo
export const demoCursos: Curso[] = [...]

// Paso 3: Función API (comentada)
// export const getCursos = async () => {
//   const response = await fetch(`${API_BASE_URL}/cursos`)
//   return response.json()
// }
```

### Pasos para Conectar Backend

#### 1. Configurar URL de API

**Archivo:** `.env.local`

```env
VITE_API_URL=http://localhost:8000/api
VITE_GEMINI_API_KEY=AIzaSyDk_oOKIcgeoodDFyvvb8u1h-JSN0bENOA
```

#### 2. Descomentar función de API

En `client/services/api.ts`:

```typescript
export const getCursos = async () => {
  const response = await fetch(`${API_BASE_URL}/cursos`);
  if (!response.ok) throw new Error("Error obteniendo cursos");
  return response.json();
};
```

#### 3. Actualizar componentes

**Antes (con demo):**

```typescript
import { demoCursos } from "@/services/api";

export default function Cursos() {
  const [cursos] = useState(demoCursos);
}
```

**Después (con API):**

```typescript
import { getCursos, demoCursos } from "@/services/api"
import { useEffect } from "react"

export default function Cursos() {
  const [cursos, setCursos] = useState(demoCursos)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getCursos()
      .then(setCursos)
      .catch(() => {}) // Mantener datos demo en error
      .finally(() => setLoading(false))
  }, [])

  return loading ? <div>Cargando...</div> : <div>...</div>
}
```

### Endpoints de Laravel Requeridos

Consulta `DOCUMENTACION_API.md` para la lista completa de endpoints por módulo.

**Ejemplos:**

```
GET /api/cursos
GET /api/cursos?categoria=Finanzas
POST /api/cursos/{id}/inscribir
GET /api/apoyos/personalizados
POST /api/apoyos/{id}/aplicar
GET /api/admin/productores/pendientes
POST /api/admin/productores/{id}/validar
```

---

## 💬 Chatbot de Gemini

El chatbot está disponible en todas las vistas como un ícono flotante en la esquina inferior derecha.

### Características:

- ✅ Integrado en todos los módulos
- ✅ Contexto de la página actual
- ✅ Base de conocimiento sobre la plataforma
- ✅ Respuestas en español
- ✅ Interfaz flotante (no interfiere)

### Configuración:

**Archivo:** `client/components/ChatBot.tsx`

```typescript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

La API key ya está configurada en `.env.local`.

---

## 📱 Adaptar para Android (Kotlin/Jetpack Compose)

Este proyecto frontend puede ser referencia para implementar en Kotlin:

### Decisiones de Diseño para Móvil:

1. **Responsive Design** - Funciona en pantallas pequeñas
2. **Touch-Friendly** - Botones grandes, espaciado adecuado
3. **Mapas Interactivos** - Prepare componentes de mapa
4. **Geolocalización** - API de ubicación preparada
5. **Offline Support** - Estructura para sincronización

### Flujo de Mapas (para tu equipo de Kotlin):

```kotlin
// Referencia del componente web
// client/pages/producer/Geomapa.tsx

// En Kotlin:
// 1. Usar Google Maps o Mapbox
// 2. Implementar layers toggle
// 3. Dibujar polígonos de parcelas
// 4. Mostrar recursos (centros de acopio, etc)
```

---

## 📊 Estructura de Carpetas

```
client/
├── pages/
│   ├── auth/
│   │   ├── LoginProducer.tsx
│   │   ├── LoginAdmin.tsx
│   │   └── RegisterProducer.tsx
│   ├── producer/
│   │   ├── CalendarioAgricola.tsx
│   │   ├── Geomapa.tsx
│   │   ├── SolicitarApoyos.tsx
│   │   ├── CursosCapacitacion.tsx
│   │   ├── ForosDiscusion.tsx
│   │   └── PanelTransparencia.tsx
│   ├── admin/
│   │   ├── ValidacionProductores.tsx
│   │   ├── ValidacionSolicitudes.tsx
│   │   ├── GestionCursos.tsx
│   │   ├── GestionApoyos.tsx
│   │   └── ModeracionForos.tsx
│   ├── ProducerDashboard.tsx
│   └── AdminDashboard.tsx
├── components/
│   ├���─ Header.tsx
│   ├── ChatBot.tsx
│   └── ui/ (Radix UI components)
├── services/
│   └── api.ts (Cliente API centralizado)
└── App.tsx (Rutas principales)
```

---

## 🔐 Seguridad y Autenticación

### Token JWT

Los tokens se guardan en `localStorage`:

```typescript
localStorage.setItem("authToken", token);
localStorage.setItem("userId", userId);
```

### Headers de Autenticación

```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
}
```

**Nota:** Para producción, migrar a cookies seguras en el servidor.

---

## 🎨 Personalización de Estilos

### Colores Principales

```css
/* Primary Green */
--primary: 142 71% 45%; /* #22C55E */

/* Secondary Cyan */
--secondary: 188 100% 50%; /* #00B8CC */
```

Editar en `client/global.css` y `tailwind.config.ts`.

---

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Con watch mode
pnpm test -- --watch
```

---

## 📦 Build para Producción

```bash
# Compilar
pnpm build

# Verificar el build
pnpm build
```

Los archivos compilados estarán en `dist/spa/`.

---

## 📞 Contacto y Soporte

**Equipo de Desarrollo:**

- Frontend: React/TypeScript/TailwindCSS
- Backend: Laravel (a implementar)
- Mobile: Kotlin/Jetpack Compose (a implementar)

**Email de Soporte:** support@semilladigital.mx

---

## 📝 Notas Importantes

1. ✅ **Datos Demo:** Todos los módulos tienen datos demo listos
2. ✅ **APIs Preparadas:** Las funciones de API están comentadas y listas
3. ✅ **Escalabilidad:** Estructura modular para fácil expansión
4. ✅ **Chatbot:** Gemini integrado en todas las vistas
5. ✅ **Documentación:** Completa en `DOCUMENTACION_API.md`
6. ⚠️ **Próximos Pasos:** Implementar backend en Laravel

---

## 🚀 Próximos Pasos

1. **Implementar Backend en Laravel**
   - Crear modelos y migraciones
   - Implementar endpoints según `DOCUMENTACION_API.md`
   - Configurar autenticación JWT

2. **Conectar con APIs**
   - Descomentar funciones en `client/services/api.ts`
   - Actualizar `.env.local` con URL de API
   - Probar integración

3. **Implementar Mobile**
   - Crear proyecto en Kotlin
   - Usar este frontend como referencia de UX
   - Implementar con Jetpack Compose

4. **Desplegar**
   - Frontend en Netlify/Vercel
   - Backend en servidor Linux (DigitalOcean, AWS, etc)
   - Base de datos PostgreSQL

---

**Última Actualización:** Enero 2024
**Versión:** 1.0.0
