const http = require("http");
const { URL } = require("url");
const {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("./store");
const {
  validateCreateTask,
  validateUpdateTask,
  normalizeTaskInput,
  normalizeTaskPatch,
} = require("./validators");

const PORT = Number(process.env.PORT || 3001);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  return sendJson(res, 404, { error: "Recurso no encontrado." });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Payload demasiado grande."));
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
        reject(new Error("JSON invalido."));
      }
    });

    req.on("error", reject);
  });
}

function applyListFilters(allTasks, searchParams) {
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const category = searchParams.get("category") || "all";
  const priority = searchParams.get("priority") || "all";
  const completedRaw = searchParams.get("completed");

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

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url || !req.method) return notFound(res);

    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = url;

    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, { status: "ok", uptime: process.uptime() });
      return;
    }

    if (req.method === "GET" && pathname === "/api/tasks") {
      const filtered = applyListFilters(listTasks(), url.searchParams);
      sendJson(res, 200, { data: filtered, count: filtered.length });
      return;
    }

    if (req.method === "POST" && pathname === "/api/tasks") {
      const body = await parseBody(req);
      const validationErrors = validateCreateTask(body);
      if (validationErrors.length > 0) {
        sendJson(res, 400, { error: "Payload invalido.", details: validationErrors });
        return;
      }

      const task = createTask(normalizeTaskInput(body));
      sendJson(res, 201, { data: task });
      return;
    }

    if (pathname.startsWith("/api/tasks/")) {
      const id = pathname.replace("/api/tasks/", "");
      if (!id) return notFound(res);

      if (req.method === "GET") {
        const task = getTaskById(id);
        if (!task) return notFound(res);
        sendJson(res, 200, { data: task });
        return;
      }

      if (req.method === "PATCH") {
        const body = await parseBody(req);
        const validationErrors = validateUpdateTask(body);
        if (validationErrors.length > 0) {
          sendJson(res, 400, { error: "Payload invalido.", details: validationErrors });
          return;
        }

        const task = updateTask(id, normalizeTaskPatch(body));
        if (!task) return notFound(res);
        sendJson(res, 200, { data: task });
        return;
      }

      if (req.method === "DELETE") {
        const deleted = deleteTask(id);
        if (!deleted) return notFound(res);
        sendJson(res, 200, { message: "Tarea eliminada." });
        return;
      }
    }

    notFound(res);
  } catch (error) {
    sendJson(res, 500, {
      error: "Error interno del servidor.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`TaskFlow API escuchando en http://localhost:${PORT}`);
});
