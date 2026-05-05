# TaskFlow App

Aplicacion web de gestion de tareas con interfaz moderna y API REST propia. Permite crear, listar, filtrar, actualizar y eliminar tareas con categorias y prioridad.

## Caracteristicas

- Crear tareas con titulo, categoria y prioridad.
- Listar tareas con filtros por categoria, prioridad, estado y busqueda por texto.
- Marcar tareas como completadas o reabrirlas.
- Eliminar tareas.
- Interfaz responsive con modo oscuro.
- API REST integrada en el mismo proyecto.
- Healthcheck disponible en `/api/health`.

## Tecnologias usadas

### Frontend

- HTML5.
- JavaScript (vanilla, sin framework).
- Tailwind CSS via CDN.

### Backend

- Node.js.
- Express 5.
- API REST con almacenamiento en memoria (sin base de datos).

### Auxiliares

- npm para gestion de dependencias y scripts.
- Vercel para despliegue.
- `vercel.json` para rutas y configuracion de build.

## Estructura del proyecto

```text
app/
|- app.js              # Logica de frontend (UI + llamadas a /api)
|- index.html          # Vista principal
|- index.js            # Servidor Express + endpoints API + estaticos
|- vercel.json         # Configuracion de despliegue en Vercel
|- package.json
|- package-lock.json
`- node_modules/
```

## Como descargar y ejecutar en local

### 1) Clonar repositorio

```bash
git clone <URL_DEL_REPO>
cd app
```

### 2) Instalar dependencias

```bash
npm install
```

### 3) Ejecutar

```bash
npm run dev
```

La app quedara disponible en:

- `http://localhost:3000`
- API en `http://localhost:3000/api`

## Endpoints principales del backend

- `GET /api/health`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Despliegue en Vercel

Este proyecto ya incluye `vercel.json`, por lo que frontend y backend se despliegan juntos en un solo proyecto de Vercel.

### Opcion A (recomendada): desplegar todo junto

1. Importa el repositorio en Vercel.
2. Selecciona como Root Directory la carpeta `app`.
3. Deploy.

Con esta configuracion:

- `index.js` corre como funcion Node (`@vercel/node`).
- `index.html` y `app.js` se sirven como estaticos.
- El frontend consumira `/api` en el mismo dominio.

### Opcion B: desplegar por CLI

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

> Ejecuta los comandos dentro de la carpeta `app`.

## Desplegar frontend y backend por separado (si quieres separarlos)

Por defecto el proyecto esta preparado para despliegue unificado. Si necesitas separarlos:

1. **Backend**: crear un proyecto Vercel solo para API (por ejemplo con `index.js` o moviendo API a `/api` dedicado).
2. **Frontend**: crear otro proyecto solo estatico (`index.html` + `app.js`).
3. En frontend, definir `window.TASKFLOW_API_BASE_URL` apuntando al dominio del backend (ejemplo: `https://mi-api.vercel.app/api`).

Si no haces esta separacion, no necesitas configurar `TASKFLOW_API_BASE_URL`, porque el frontend usa `window.location.origin + "/api"` automaticamente.
