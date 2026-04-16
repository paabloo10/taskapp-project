# TaskFlow Server

API REST de TaskFlow implementada con Node.js (`http` nativo), sin frameworks.

## Objetivo

Exponer operaciones CRUD de tareas con validacion de payload, filtros por query y manejo de errores consistente para el frontend.

## Stack

- Node.js 18+
- Modulos CommonJS
- Sin base de datos (almacenamiento en memoria)

## Estructura

- `src/server.js`: router HTTP, parseo body, CORS, respuestas y errores.
- `src/store.js`: capa de datos en memoria.
- `src/validators.js`: reglas de validacion y normalizacion.

## Modelo de datos

```json
{
  "id": "uuid",
  "text": "string (1..120)",
  "category": "work | personal",
  "priority": "low | medium | high",
  "completed": "boolean",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

## Ejecutar servidor

```bash
cd server
npm start
```

Servidor en: `http://localhost:3001`.

## API de Endpoints

### `GET /api/health`

Healthcheck.

**200**

```json
{
  "status": "ok",
  "uptime": 12.34
}
```

---

### `GET /api/tasks`

Lista tareas con filtros opcionales:

- `search` (texto parcial)
- `category` (`all|work|personal`)
- `priority` (`all|low|medium|high`)
- `completed` (`all|true|false`)

**200**

```json
{
  "data": [],
  "count": 0
}
```

---

### `POST /api/tasks`

Crea tarea.

**Body**

```json
{
  "text": "Preparar release",
  "category": "work",
  "priority": "high"
}
```

**201**

```json
{
  "data": {
    "id": "uuid",
    "text": "Preparar release",
    "category": "work",
    "priority": "high",
    "completed": false,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

**400** (validacion)

```json
{
  "error": "Payload invalido.",
  "details": ["`text` es obligatorio."]
}
```

---

### `GET /api/tasks/:id`

Obtiene una tarea por ID.

- **200** con `data`
- **404** si no existe

---

### `PATCH /api/tasks/:id`

Actualiza parcialmente:

- `text`
- `category`
- `priority`
- `completed`

**Body ejemplo**

```json
{
  "completed": true
}
```

- **200** con `data`
- **400** si payload invalido
- **404** si ID no existe

---

### `DELETE /api/tasks/:id`

Elimina una tarea.

- **200** `{ "message": "Tarea eliminada." }`
- **404** si ID no existe

## Contrato de errores

- Error de validacion: `400` + `error` + `details[]`
- Recurso inexistente: `404` + `error`
- Error inesperado: `500` + `error` + `details`

Todos los endpoints devuelven `application/json`.

## Fragmentos tecnicos: routing de API

Resolucion de ruta dinamica en Vercel (`api/[...path].js`):

```js
const pathParts = Array.isArray(req.query.path) ? req.query.path : [];
const resource = pathParts[0] || "";
const id = pathParts[1] || "";
```

Ejemplo de endpoint de listado con filtros:

```js
if (req.method === "GET" && !id) {
  const filtered = applyListFilters(tasks, req.query);
  sendJson(res, 200, { data: filtered, count: filtered.length });
  return;
}
```

Endpoint de creacion con validacion:

```js
if (req.method === "POST" && !id) {
  const body = parseBody(req);
  const errors = validateCreateTask(body);
  if (errors.length > 0) {
    sendJson(res, 400, { error: "Payload invalido.", details: errors });
    return;
  }
  // ... crear tarea
}
```

## Fragmentos tecnicos: seguimiento de errores en servidor

Parseo seguro de body (detecta JSON invalido):

```js
function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new Error("JSON invalido.");
    }
  }
  if (typeof req.body === "object") return req.body;
  return {};
}
```

Validaciones de negocio y devolucion de trazas de error funcionales (`details`):

```js
const errors = validateUpdateTask(body);
if (errors.length > 0) {
  sendJson(res, 400, { error: "Payload invalido.", details: errors });
  return;
}
```

Bloque de captura global para errores inesperados:

```js
try {
  // ... routing y handlers
} catch (error) {
  sendJson(res, 500, {
    error: "Error interno del servidor.",
    details: error instanceof Error ? error.message : "Unknown error",
  });
}
```

Control explicito de errores HTTP comunes:

```js
if (resource !== "tasks") {
  sendJson(res, 404, { error: "Recurso no encontrado." });
  return;
}

sendJson(res, 405, { error: "Metodo no permitido." });
```

## CORS

Cabeceras configuradas para permitir consumo desde frontend local:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET,POST,PATCH,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Debug exhaustivo mediante endpoints

Secuencia recomendada:

1. Verificar salud:
   - `GET /api/health`
2. Crear tarea valida:
   - `POST /api/tasks`
3. Forzar validacion:
   - `POST /api/tasks` con `text: ""`
4. Obtener listado filtrado:
   - `GET /api/tasks?priority=high`
5. Marcar completada:
   - `PATCH /api/tasks/:id` con `{ "completed": true }`
6. Confirmar filtro de completadas:
   - `GET /api/tasks?completed=true`
7. Eliminar tarea:
   - `DELETE /api/tasks/:id`
8. Confirmar 404:
   - `GET /api/tasks/:id` eliminado

## Limitaciones actuales

- Sin persistencia (se pierde en reinicio).
- Sin autenticacion/autorizacion.
- Sin rate limiting.
- Sin tests automatizados integrados (se usan pruebas por endpoint manuales).

## Siguientes mejoras sugeridas

- Persistencia en SQLite/PostgreSQL.
- Tests automatizados de API (supertest/vitest).
- Logging estructurado y trazas de error.
- Versionado de API (`/api/v1`).
