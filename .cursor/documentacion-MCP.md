## Documentación MCP (Model Context Protocol)


### 1) Instalación / configuración

#### Requisitos

- **Node.js** instalado (para poder ejecutar `npx`).
- Cursor con soporte de MCP habilitado.

#### Archivo de configuración

La configuración vive en:

- `.cursor/mcp.json`

Contenido actual (resumen):

- **Servidor**: `filesystem`
- **Comando**: `npx -y @modelcontextprotocol/server-filesystem taskflow1/docs`

Esto significa que el servidor MCP de filesystem se levanta con `npx` y queda restringido a la carpeta:

- `taskflow1/docs` (y sus subcarpetas)

#### Pasos típicos

1. Asegúrate de tener Node.js funcionando:
   - en terminal: `node -v` y `npx -v`
2. Verifica que exista `.cursor/mcp.json` en el proyecto.
3. Reinicia/reabre el proyecto en Cursor para que detecte el servidor.
4. Comprueba que el servidor lista directorios permitidos (allowed directories) y que incluye `docs/`.

---

### 2) 5 ejemplos de consultas distintas al servidor MCP

> Nota: los nombres exactos de las herramientas pueden variar según el servidor MCP, pero en este proyecto (filesystem) normalmente existen herramientas como: `list_directory`, `directory_tree`, `search_files`, `read_text_file` y `get_file_info`.

#### Ejemplo 1 — Listar el contenido de `docs/ai`

**Objetivo**: ver qué archivos `.md` hay dentro de `docs/ai`.

Consulta (conceptual):

```json
{
  "tool": "list_directory",
  "arguments": { "path": "C:\\\\Users\\\\pablo\\\\taskflow1\\\\docs\\\\ai" }
}
```

---

#### Ejemplo 2 — Obtener el árbol completo de `docs/`

**Objetivo**: ver la estructura completa de `docs/` en formato árbol.

```json
{
  "tool": "directory_tree",
  "arguments": {
    "path": "C:\\\\Users\\\\pablo\\\\taskflow1\\\\docs",
    "excludePatterns": []
  }
}
```

---

#### Ejemplo 3 — Buscar archivos por nombre dentro de `docs/`

**Objetivo**: localizar archivos que contengan “prompt” en el nombre (por ejemplo `prompt-engineering.md`).

```json
{
  "tool": "search_files",
  "arguments": {
    "path": "C:\\\\Users\\\\pablo\\\\taskflow1\\\\docs",
    "query": "prompt"
  }
}
```

---

#### Ejemplo 4 — Leer un archivo de documentación

**Objetivo**: leer el contenido de `docs/ai/ai-comparison.md`.

```json
{
  "tool": "read_text_file",
  "arguments": { "path": "C:\\\\Users\\\\pablo\\\\taskflow1\\\\docs\\\\ai\\\\ai-comparison.md" }
}
```

---

#### Ejemplo 5 — Ver información de un archivo (tamaño/fechas)

**Objetivo**: inspeccionar metadatos de un archivo sin leerlo completo.

```json
{
  "tool": "get_file_info",
  "arguments": { "path": "C:\\\\Users\\\\pablo\\\\taskflow1\\\\docs\\\\ai\\\\reflection.md" }
}
```

---


