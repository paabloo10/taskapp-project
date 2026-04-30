const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});
app.use(express.json());
app.use(express.static(__dirname));

const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_CATEGORIES = ["work", "personal"];

const tasks = [];
let nextId = 1;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "API funcionando" });
});

app.get("/api/tasks", (req, res) => {
  const { category, priority, completed, q } = req.query;

  let filteredTasks = [...tasks];

  if (category) {
    filteredTasks = filteredTasks.filter((task) => task.category === category);
  }

  if (priority) {
    filteredTasks = filteredTasks.filter((task) => task.priority === priority);
  }

  if (completed !== undefined) {
    const completedValue = completed === "true";
    filteredTasks = filteredTasks.filter((task) => task.completed === completedValue);
  }

  if (q) {
    const query = q.toLowerCase();
    filteredTasks = filteredTasks.filter((task) =>
      task.title.toLowerCase().includes(query)
    );
  }

  res.json(filteredTasks);
});

app.get("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  return res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const { title, category = "personal", priority = "low" } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res
      .status(400)
      .json({ error: "El campo 'title' es obligatorio y debe ser texto" });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `Categoría inválida. Usa: ${VALID_CATEGORIES.join(", ")}`,
    });
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: `Prioridad inválida. Usa: ${VALID_PRIORITIES.join(", ")}`,
    });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    category,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  return res.status(201).json(task);
});

app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  const { title, category, priority, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res
        .status(400)
        .json({ error: "Si envías 'title', debe ser texto no vacío" });
    }
    task.title = title.trim();
  }

  if (category !== undefined) {
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: `Categoría inválida. Usa: ${VALID_CATEGORIES.join(", ")}`,
      });
    }
    task.category = category;
  }

  if (priority !== undefined) {
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `Prioridad inválida. Usa: ${VALID_PRIORITIES.join(", ")}`,
      });
    }
    task.priority = priority;
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({
        error: "Si envías 'completed', debe ser true o false",
      });
    }
    task.completed = completed;
  }

  return res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  tasks.splice(index, 1);
  return res.status(204).send();
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API REST escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
