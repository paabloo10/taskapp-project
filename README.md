# TaskApp

TaskApp es una aplicacion web para gestionar tareas con categorias, prioridades y estado de completado.

## Arquitectura actual

- `index.html`: interfaz principal (Tailwind CDN).
- `app.js`: cliente web; ahora consume API REST.
- `server/`: API Node.js para CRUD, filtros y validaciones.

## Flujo funcional

1. Crear tarea desde formulario.
2. Listar tareas aplicando filtros (texto, categoria, prioridad, completadas).
3. Marcar tarea como completada/reabierta.
4. Eliminar tarea.
5. Cambiar tema oscuro/claro (persistido en navegador).

## Ejecutar en local

### 1) Levantar API

```bash
cd server
npm start
```

API por defecto en `http://localhost:3001`.

### 2) Abrir frontend

Abrir `index.html` en navegador o usar servidor estatico local.

El frontend usa por defecto:

`http://localhost:3001/api`

Si necesitas otra URL, define en `index.html` antes de cargar `app.js`:

```html
<script>
  window.TASKFLOW_API_BASE_URL = "https://tu-api/api";
</script>
```

## Endpoints disponibles

- `GET /api/health`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

Para detalle tecnico exhaustivo, ver `server/README.md`.

## Fragmentos clave: llamadas de API (frontend)

Base URL de API con fallback local y soporte en despliegue:

```js
const DEFAULT_API_BASE_URL =
  window.location.protocol === "file:" ? "http://localhost:3001/api" : `${window.location.origin}/api`;
const API_BASE_URL = window.TASKFLOW_API_BASE_URL || DEFAULT_API_BASE_URL;
```

Wrapper centralizado de llamadas HTTP (`fetch`) y parseo de errores:

```js
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = Array.isArray(payload.details) ? `\n- ${payload.details.join("\n- ")}` : "";
    throw new Error(`${payload.error || "Error de API"}${details}`);
  }
  return payload;
}
```

Lectura de tareas con filtros por query params:

```js
async function fetchTasks() {
  const query = getCurrentQueryParams().toString();
  const payload = await apiRequest(`/tasks?${query}`, { method: "GET" });
  return Array.isArray(payload.data) ? payload.data : [];
}
```

Mutaciones de estado por endpoint:

```js
await apiRequest("/tasks", {
  method: "POST",
  body: JSON.stringify({ text, category, priority }),
});

await apiRequest(`/tasks/${task.id}`, {
  method: "PATCH",
  body: JSON.stringify({ completed: !task.completed }),
});

await apiRequest(`/tasks/${task.id}`, { method: "DELETE" });
```

## Fragmentos clave: seguimiento y visualizacion de errores

Error de backend normalizado en `apiRequest` (incluye `details[]`):

```js
if (!response.ok) {
  const details = Array.isArray(payload.details) ? `\n- ${payload.details.join("\n- ")}` : "";
  throw new Error(`${payload.error || "Error de API"}${details}`);
}
```

Render de error en UI cuando falla carga de lista:

```js
try {
  const tasks = await fetchTasks();
  for (const task of tasks) taskListContainer.appendChild(createTaskElement(task));
} catch (error) {
  taskListContainer.innerHTML =
    `<div class="rounded-xl border border-red-300 bg-red-50 text-red-700 p-3">${error.message}</div>`;
}
```

Errores de mutacion informados al usuario en acciones (`POST/PATCH/DELETE`):

```js
try {
  await apiRequest(`/tasks/${task.id}`, { method: "DELETE" });
  await renderTasks();
} catch (error) {
  alert(error.message);
}
```

## Debug rapido

- Si el frontend muestra error de API:
  - verifica que `server` este levantado.
  - verifica CORS y URL de API.
  - prueba `GET /api/health`.
- Si hay error de validacion:
  - revisar mensajes en respuesta JSON (`details`).
