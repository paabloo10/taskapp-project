# TaskFlow

Documentación rápida del programa (app web de gestión de tareas).

---

## 1. Descripción general

TaskFlow es una aplicación web tipo “gestor de tareas” (front-end) construida con:
- Tailwind CSS (vía CDN) para estilos y componentes.
- JavaScript (sin framework) para la lógica.
- `localStorage` para persistir tareas y la preferencia de modo oscuro.

## 2. Funciones principales

- Crear tareas con:
  - Texto (descripción)
  - Categoría: `Trabajo` / `Personal`
  - Prioridad: `Low` / `Medium` / `High`
- Listar tareas en tarjetas.
- Eliminar tareas.
- Filtrar en tiempo real:
  - Por categoría (Todas / Trabajo / Personal)
  - Por prioridad (Todas / low / medium / high)
  - Buscador de texto (coincidencia parcial, case-insensitive)
- Modo oscuro con persistencia (se recuerda al recargar).

## 3. Estructura del proyecto

- `index.html`
  - Contiene la interfaz: header, sidebar (filtros), formulario, buscador y lista de tareas.
  - Incluye Tailwind CSS desde CDN.
  - Carga `app.js`.
- `app.js`
  - Gestiona el estado de las tareas (crear, guardar, eliminar).
  - Renderiza la lista filtrada.
  - Maneja búsquedas y filtros.
  - Inicializa y persiste el modo oscuro.
- `.cursor/mcp.json` (opcional para MCP)
  - Configura un servidor MCP (filesystem) para acceder a documentación dentro de `docs/`.

## 4. Instalación / ejecución

Esta app es “estática” (solo front-end):
1. Abre `index.html` en un navegador moderno.
2. Asegúrate de que `app.js` esté en la misma carpeta.

No se requiere:
- `npm install`
- build tools
- bundlers

## 5. Cómo usar la aplicación

### 5.1. Crear una tarea
1. Escribe un texto en “Nueva tarea...”.
2. Selecciona categoría: `Personal` o `Trabajo`.
3. Selecciona prioridad: `Low` / `Medium` / `High`.
4. Pulsa “Añadir”.

Validaciones (en `app.js`)
- El texto no puede estar vacío.
- Máximo 120 caracteres.
- La categoría debe ser válida (`work`/`personal`).
- La prioridad debe ser válida (`low`/`medium`/`high`).

Si falla la validación, se muestra un `alert(...)`.

### 5.2. Eliminar tareas
- Cada tarjeta incluye un botón “X”.
- Al eliminar:
  - se actualiza el array
  - se guarda en `localStorage`
  - se re-renderiza la lista

### 5.3. Filtrar y buscar

Filtros (sidebar / selects):
- Categoría: Todas / Trabajo / Personal
- Prioridad: Todas / Low / Medium / High
- Buscador: “Buscar tareas...”

Los filtros se combinan (texto + categoría + prioridad).

### 5.4. Modo oscuro
- Botón “Modo oscuro” en el header.
- Se guarda en `localStorage` como `theme`:
  - `"dark"` o `"light"`.

## 6. Persistencia (localStorage)

La app guarda:
- `tasks`: array JSON con:
  - `id` (string)
  - `text` (string)
  - `category` (`work`/`personal`)
  - `priority` (`low`/`medium`/`high`)
- `theme`: `"dark"`/`"light"`

Al recargar:
- se cargan las tareas y se renderizan
- se aplica el tema guardado
