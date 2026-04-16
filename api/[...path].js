const { randomUUID } = require("crypto");

const allowedCategories = new Set(["work", "personal"]);
const allowedPriorities = new Set(["low", "medium", "high"]);

/** @type {Array<{
 * id: string,
 * text: string,
 * category: "work" | "personal",
 * priority: "low" | "medium" | "high",
 * completed: boolean,
 * createdAt: string,
 * updatedAt: string
 * }>}
 */
const tasks = [];

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function sendJson(res, statusCode, payload) {
  // En Vercel suele existir `res.status().json()`, pero lo hacemos compatible con Node puro
  // para evitar fallos 500 si esos helpers no están.
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(statusCode).json(payload);
    return;
  }

  const body = JSON.stringify(payload);
  if (typeof res.writeHead === "function") {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  } else {
    res.statusCode = statusCode;
    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
  }
  res.end(body);
}

function parseBody(req) {
  // Vercel Node functions no siempre exponen `req.body` parseado.
  // Soportamos ambos casos: body ya parseado (obj/string) o stream raw.
  if (req.body !== undefined) {
    if (!req.body) return {};
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch {
        throw new HttpError(400, "JSON invalido.");
      }
    }
    if (typeof req.body === "object") return req.body;
    return {};
  }

  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new HttpError(413, "Payload demasiado grande."));
      }
    });

    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new HttpError(400, "JSON invalido."));
      }
    });

    req.on("error", (error) => reject(new HttpError(400, error instanceof Error ? error.message : "Error de lectura.")));
  });
}

function validateCreateTask(payload) {
  const errors = [];
  if (!payload || typeof payload !== "object") return ["El cuerpo debe ser un objeto JSON valido."];
  if (typeof payload.text !== "string" || payload.text.trim().length === 0) {
    errors.push("`text` es obligatorio.");
  } else if (payload.text.trim().length > 120) {
    errors.push("`text` no puede superar 120 caracteres.");
  }
  if (!allowedCategories.has(payload.category)) {
    errors.push("`category` debe ser `work` o `personal`.");
  }
  if (!allowedPriorities.has(payload.priority)) {
    errors.push("`priority` debe ser `low`, `medium` o `high`.");
  }
  return errors;
}

function validateUpdateTask(payload) {
  const errors = [];
  if (!payload || typeof payload !== "object") return ["El cuerpo debe ser un objeto JSON valido."];
  const hasKnownField =
    Object.prototype.hasOwnProperty.call(payload, "text") ||
    Object.prototype.hasOwnProperty.call(payload, "category") ||
    Object.prototype.hasOwnProperty.call(payload, "priority") ||
    Object.prototype.hasOwnProperty.call(payload, "completed");
  if (!hasKnownField) return ["Debes enviar al menos un campo actualizable."];

  if (Object.prototype.hasOwnProperty.call(payload, "text")) {
    if (typeof payload.text !== "string" || payload.text.trim().length === 0) {
      errors.push("`text` debe ser un string no vacio.");
    } else if (payload.text.trim().length > 120) {
      errors.push("`text` no puede superar 120 caracteres.");
    }
  }
  if (Object.prototype.hasOwnProperty.call(payload, "category") && !allowedCategories.has(payload.category)) {
    errors.push("`category` debe ser `work` o `personal`.");
  }
  if (Object.prototype.hasOwnProperty.call(payload, "priority") && !allowedPriorities.has(payload.priority)) {
    errors.push("`priority` debe ser `low`, `medium` o `high`.");
  }
  if (Object.prototype.hasOwnProperty.call(payload, "completed") && typeof payload.completed !== "boolean") {
    errors.push("`completed` debe ser booleano.");
  }
  return errors;
}

function applyListFilters(allTasks, query) {
  const search = String(query.search || "").trim().toLowerCase();
  const category = String(query.category || "all");
  const priority = String(query.priority || "all");
  const completedRaw = query.completed === undefined ? null : String(query.completed);

  return allTasks.filter((task) => {
    const matchSearch = !search || task.text.toLowerCase().includes(search);
    const matchCategory = category === "all" || task.category === category;
    const matchPriority = priority === "all" || task.priority === priority;
    const matchCompleted =
      completedRaw === null ||
      completedRaw === "all" ||
      (completedRaw === "true" && task.completed) ||
      (completedRaw === "false" && !task.completed);
    return matchSearch && matchCategory && matchPriority && matchCompleted;
  });
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const pathParts = Array.isArray(req.query.path) ? req.query.path : [];
    const resource = pathParts[0] || "";
    const id = pathParts[1] || "";

    if (req.method === "GET" && resource === "health") {
      sendJson(res, 200, { status: "ok" });
      return;
    }

    if (resource !== "tasks") {
      sendJson(res, 404, { error: "Recurso no encontrado." });
      return;
    }

    if (req.method === "GET" && !id) {
      const filtered = applyListFilters(tasks, req.query);
      sendJson(res, 200, { data: filtered, count: filtered.length });
      return;
    }

    if (req.method === "POST" && !id) {
      const body = await parseBody(req);
      const errors = validateCreateTask(body);
      if (errors.length > 0) {
        sendJson(res, 400, { error: "Payload invalido.", details: errors });
        return;
      }
      const timestamp = new Date().toISOString();
      const newTask = {
        id: randomUUID(),
        text: body.text.trim(),
        category: body.category,
        priority: body.priority,
        completed: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      tasks.push(newTask);
      sendJson(res, 201, { data: newTask });
      return;
    }

    const task = tasks.find((item) => item.id === id);
    if (!task) {
      sendJson(res, 404, { error: "Recurso no encontrado." });
      return;
    }

    if (req.method === "GET") {
      sendJson(res, 200, { data: task });
      return;
    }

    if (req.method === "PATCH") {
      const body = await parseBody(req);
      const errors = validateUpdateTask(body);
      if (errors.length > 0) {
        sendJson(res, 400, { error: "Payload invalido.", details: errors });
        return;
      }

      if (Object.prototype.hasOwnProperty.call(body, "text")) task.text = body.text.trim();
      if (Object.prototype.hasOwnProperty.call(body, "category")) task.category = body.category;
      if (Object.prototype.hasOwnProperty.call(body, "priority")) task.priority = body.priority;
      if (Object.prototype.hasOwnProperty.call(body, "completed")) task.completed = body.completed;
      task.updatedAt = new Date().toISOString();
      sendJson(res, 200, { data: task });
      return;
    }

    if (req.method === "DELETE") {
      const index = tasks.findIndex((item) => item.id === id);
      if (index === -1) {
        sendJson(res, 404, { error: "Recurso no encontrado." });
        return;
      }
      tasks.splice(index, 1);
      sendJson(res, 200, { message: "Tarea eliminada." });
      return;
    }

    sendJson(res, 405, { error: "Metodo no permitido." });
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.statusCode, { error: error.message });
      return;
    }
    sendJson(res, 500, {
      error: "Error interno del servidor.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
