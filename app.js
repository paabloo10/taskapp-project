const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("category");
const prioritySelect = document.getElementById("priority");
const taskListContainer = document.getElementById("taskList");
const categorySidebar = document.getElementById("categorySidebar");
const searchInput = document.getElementById("searchInput");
const filterCategorySelect = document.getElementById("filterCategory");
const filterPrioritySelect = document.getElementById("filterPriority");
const toggleCompletedViewButton = document.getElementById("toggleCompletedView");
const darkModeToggleButton = document.getElementById("toggleDark");

const DEFAULT_API_BASE_URL =
  window.location.protocol === "file:" ? "http://localhost:3001/api" : `${window.location.origin}/api`;
const API_BASE_URL = window.TASKFLOW_API_BASE_URL || DEFAULT_API_BASE_URL;

/** @typedef {"low" | "medium" | "high"} TaskPriority */
/** @typedef {"work" | "personal"} TaskCategory */

/** @type {"all" | TaskCategory} */
let activeCategoryFilter = "all";
/** @type {"all" | TaskPriority} */
let activePriorityFilter = "all";
let searchQuery = "";
let showCompletedOnly = false;

function formatPriorityLabel(priority) {
  const labels = { high: "Alta", medium: "Media", low: "Baja" };
  return labels[priority] ?? priority;
}

function formatCategoryLabel(category) {
  const labels = { work: "Trabajo", personal: "Personal" };
  return labels[category] ?? category;
}

function getCurrentQueryParams() {
  const params = new URLSearchParams();
  params.set("search", searchQuery.trim());
  params.set("category", activeCategoryFilter);
  params.set("priority", activePriorityFilter);
  params.set("completed", showCompletedOnly ? "true" : "all");
  return params;
}

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

async function fetchTasks() {
  const query = getCurrentQueryParams().toString();
  const payload = await apiRequest(`/tasks?${query}`, { method: "GET" });
  return Array.isArray(payload.data) ? payload.data : [];
}

function createTaskElement(task) {
  const taskCard = document.createElement("div");
  taskCard.className =
    "flex justify-between items-center p-4 rounded-lg shadow border border-black/5 dark:border-white/10 bg-white dark:bg-gray-800 transition-colors";
  if (task.completed) {
    taskCard.className += " bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-400/20";
  }

  const badgeColors = { high: "bg-high", medium: "bg-medium", low: "bg-low" };
  const title = document.createElement("h3");
  title.className = task.completed ? "font-semibold line-through" : "font-semibold";
  title.textContent = task.text;

  const meta = document.createElement("span");
  meta.className = "text-sm text-gray-500";
  meta.textContent = `${formatCategoryLabel(task.category)} · ${formatPriorityLabel(task.priority)}`;

  const left = document.createElement("div");
  left.className = "flex flex-col";
  left.append(title, meta);

  const badge = document.createElement("span");
  badge.className = `text-white text-xs px-3 py-1 rounded-full ${badgeColors[task.priority]}`;
  badge.textContent = formatPriorityLabel(task.priority);

  const toggleCompletedButton = document.createElement("button");
  toggleCompletedButton.className = "toggle-completed bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded";
  toggleCompletedButton.textContent = task.completed ? "Reabrir" : "Hecha";
  toggleCompletedButton.addEventListener("click", async () => {
    try {
      await apiRequest(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed }),
      });
      await renderTasks();
    } catch (error) {
      alert(error.message);
    }
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete bg-red-500 text-white px-2 py-1 rounded";
  deleteButton.textContent = "X";
  deleteButton.addEventListener("click", async () => {
    try {
      await apiRequest(`/tasks/${task.id}`, { method: "DELETE" });
      await renderTasks();
    } catch (error) {
      alert(error.message);
    }
  });

  const right = document.createElement("div");
  right.className = "flex items-center gap-3";
  right.append(badge, toggleCompletedButton, deleteButton);

  taskCard.append(left, right);
  return taskCard;
}

async function renderTasks() {
  taskListContainer.innerHTML = "";
  try {
    const tasks = await fetchTasks();
    for (const task of tasks) {
      taskListContainer.appendChild(createTaskElement(task));
    }
  } catch (error) {
    taskListContainer.innerHTML = `<div class="rounded-xl border border-red-300 bg-red-50 text-red-700 p-3">${error.message}</div>`;
  }

  if (toggleCompletedViewButton instanceof HTMLButtonElement) {
    toggleCompletedViewButton.textContent = showCompletedOnly ? "Ver todas" : "Completadas";
    toggleCompletedViewButton.classList.toggle("ring-2", showCompletedOnly);
    toggleCompletedViewButton.classList.toggle("ring-primary/40", showCompletedOnly);
    toggleCompletedViewButton.classList.toggle("border-primary/40", showCompletedOnly);
  }
}

function syncSidebarActiveState() {
  const items = categorySidebar.querySelectorAll("[data-category]");
  items.forEach((item) => {
    const category = item.getAttribute("data-category");
    item.classList.toggle("bg-white/10", category === activeCategoryFilter);
  });
}

function initializeFilters() {
  categorySidebar.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-category]");
    if (!target) return;
    const category = target.getAttribute("data-category");
    if (category !== "all" && category !== "work" && category !== "personal") return;
    activeCategoryFilter = category;
    filterCategorySelect.value = category;
    syncSidebarActiveState();
    await renderTasks();
  });

  searchInput.addEventListener("input", async () => {
    searchQuery = searchInput.value;
    await renderTasks();
  });

  filterCategorySelect.addEventListener("change", async () => {
    const value = filterCategorySelect.value;
    if (value !== "all" && value !== "work" && value !== "personal") return;
    activeCategoryFilter = value;
    syncSidebarActiveState();
    await renderTasks();
  });

  filterPrioritySelect.addEventListener("change", async () => {
    const value = filterPrioritySelect.value;
    if (value !== "all" && value !== "low" && value !== "medium" && value !== "high") return;
    activePriorityFilter = value;
    await renderTasks();
  });

  if (toggleCompletedViewButton instanceof HTMLButtonElement) {
    toggleCompletedViewButton.addEventListener("click", async () => {
      showCompletedOnly = !showCompletedOnly;
      await renderTasks();
    });
  }
}

async function onTaskFormSubmit(event) {
  event.preventDefault();
  const text = taskInput.value.trim();
  const category = categorySelect.value;
  const priority = prioritySelect.value;

  try {
    await apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify({ text, category, priority }),
    });
    taskInput.value = "";
    await renderTasks();
  } catch (error) {
    alert(error.message);
  }
}

function initializeThemeFromStorage() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (savedTheme === "light") {
    document.documentElement.classList.remove("dark");
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

taskForm.addEventListener("submit", onTaskFormSubmit);
darkModeToggleButton.addEventListener("click", toggleDarkMode);
initializeFilters();
initializeThemeFromStorage();
syncSidebarActiveState();
renderTasks();
