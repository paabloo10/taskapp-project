const taskForm = document.getElementById("taskForm")
const taskInput = document.getElementById("taskInput")
const categorySelect = document.getElementById("category")
const prioritySelect = document.getElementById("priority")
const taskListContainer = document.getElementById("taskList")

const categorySidebar = document.getElementById("categorySidebar")
const searchInput = document.getElementById("searchInput")
const filterCategorySelect = document.getElementById("filterCategory")
const filterPrioritySelect = document.getElementById("filterPriority")

/**
 * @typedef {"low" | "medium" | "high"} TaskPriority
 */

/**
 * @typedef {"work" | "personal"} TaskCategory
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Identificador único de la tarea
 * @property {string} text - Descripción de la tarea
 * @property {TaskCategory} category - Categoría de la tarea
 * @property {TaskPriority} priority - Prioridad de la tarea
 */

/** @type {Task[]} */
let tasks = loadTasksFromStorage()

/** @type {"all" | TaskCategory} */
let activeCategoryFilter = "all"

/** @type {"all" | TaskPriority} */
let activePriorityFilter = "all"

let searchQuery = ""

/**
 * Carga las tareas desde localStorage.
 * @returns {Task[]}
 */
function loadTasksFromStorage() {
    try {
        const stored = localStorage.getItem("tasks")
        if (!stored) return []
        const parsed = JSON.parse(stored)
        const rawTasks = Array.isArray(parsed) ? parsed : []
        return rawTasks
            .filter((t) => t && typeof t === "object")
            .map((t) => {
                const priority = t.priority
                const category = t.category

                /** @type {TaskPriority} */
                const normalizedPriority =
                    priority === "low" || priority === "medium" || priority === "high" ? priority : "low"

                /** @type {TaskCategory} */
                const normalizedCategory =
                    category === "work" || category === "personal" ? category : "personal"

                return {
                    id: typeof t.id === "string" ? t.id : String(Date.now()),
                    text: typeof t.text === "string" ? t.text : "",
                    category: normalizedCategory,
                    priority: normalizedPriority
                }
            })
    } catch {
        return []
    }
}

/**
 * Guarda las tareas en localStorage.
 * @param {Task[]} tasksToSave
 */
function saveTasks(tasksToSave) {
    localStorage.setItem("tasks", JSON.stringify(tasksToSave))
}

/**
 * Normaliza la prioridad para mostrarla como texto legible.
 * @param {TaskPriority} priority
 * @returns {string}
 */
function formatPriorityLabel(priority) {
    const labels = {
        high: "Alta",
        medium: "Media",
        low: "Baja"
    }
    return labels[priority] ?? priority
}

/**
 * Normaliza la categoría para mostrarla como texto legible.
 * @param {TaskCategory} category
 * @returns {string}
 */
function formatCategoryLabel(category) {
    const labels = {
        work: "Trabajo",
        personal: "Personal"
    }
    return labels[category] ?? category
}

/**
 * Crea el elemento visual de una tarea.
 * @param {Task} task
 * @param {number} index
 * @returns {HTMLDivElement}
 */
function createTaskElement(task, index) {
    const taskCard = document.createElement("div")

    taskCard.className =
        "flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow"

    const badgeColors = {
        high: "bg-high",
        medium: "bg-medium",
        low: "bg-low"
    }

    taskCard.innerHTML = `
<div class="flex flex-col">
  <h3 class="font-semibold">${task.text}</h3>
  <span class="text-sm text-gray-500">${formatCategoryLabel(task.category)} · ${formatPriorityLabel(task.priority)}</span>
</div>

<div class="flex items-center gap-3">
  <span class="text-white text-xs px-3 py-1 rounded-full ${badgeColors[task.priority]}">
    ${formatPriorityLabel(task.priority)}
  </span>

  <button class="delete bg-red-500 text-white px-2 py-1 rounded">
    X
  </button>
</div>
`

    const deleteButton = taskCard.querySelector(".delete")
    deleteButton.addEventListener("click", () => {
        deleteTask(index)
    })

    return taskCard
}

/**
 * Elimina una tarea por índice.
 * @param {number} index
 */
function deleteTask(index) {
    tasks.splice(index, 1)
    saveTasks(tasks)
    renderTasks()
}

/**
 * Aplica filtros de texto/categoría/prioridad.
 * @param {Task[]} allTasks
 * @returns {Task[]}
 */
function getFilteredTasks(allTasks) {
    const q = searchQuery.trim().toLowerCase()

    return allTasks.filter((task) => {
        const matchesText = !q || task.text.toLowerCase().includes(q)
        const matchesCategory = activeCategoryFilter === "all" || task.category === activeCategoryFilter
        const matchesPriority = activePriorityFilter === "all" || task.priority === activePriorityFilter

        return matchesText && matchesCategory && matchesPriority
    })
}

/**
 * Sincroniza el estilo “activo” del sidebar con el filtro.
 */
function syncSidebarActiveState() {
    const items = categorySidebar.querySelectorAll("[data-category]")
    items.forEach((item) => {
        const category = item.getAttribute("data-category")
        const isActive = category === activeCategoryFilter
        item.classList.toggle("bg-white/10", isActive)
    })
}

/**
 * Limpia y vuelve a pintar la lista de tareas.
 */
function renderTasks() {
    taskListContainer.innerHTML = ""

    const filtered = getFilteredTasks(tasks)

    filtered.forEach((task) => {
        const index = tasks.findIndex((t) => t.id === task.id)
        const taskElement = createTaskElement(task, index)
        taskListContainer.appendChild(taskElement)
    })
}

/**
 * Valida el formulario de creación de tarea.
 * @param {string} text
 * @param {TaskCategory} category
 * @param {TaskPriority} priority
 * @returns {{ valid: boolean, message?: string }}
 */
function validateTaskForm(text, category, priority) {
    if (!text.trim()) {
        return { valid: false, message: "La descripción de la tarea es obligatoria." }
    }

    if (text.length > 120) {
        return {
            valid: false,
            message: "La descripción de la tarea no puede superar los 120 caracteres."
        }
    }

    const allowedCategories = ["work", "personal"]
    if (!allowedCategories.includes(category)) {
        return { valid: false, message: "La categoría seleccionada no es válida." }
    }

    const allowedPriorities = ["low", "medium", "high"]
    if (!allowedPriorities.includes(priority)) {
        return { valid: false, message: "La prioridad seleccionada no es válida." }
    }

    return { valid: true }
}

/**
 * Crea y añade una nueva tarea a la lista.
 * @param {string} text
 * @param {TaskCategory} category
 * @param {TaskPriority} priority
 */
function addTask(text, category, priority) {
    const newTask = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        text: text.trim(),
        category,
        priority
    }

    tasks.push(newTask)
    saveTasks(tasks)
    renderTasks()
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault()

    const text = taskInput.value
    const selectedCategory = /** @type {TaskCategory} */ (categorySelect.value)
    const selectedPriority = /** @type {TaskPriority} */ (prioritySelect.value)

    const { valid, message } = validateTaskForm(text, selectedCategory, selectedPriority)
    if (!valid) {
        alert(message)
        return
    }

    addTask(text, selectedCategory, selectedPriority)
    taskInput.value = ""
})

/**
 * Inicializa listeners de filtros.
 */
function initializeFilters() {
    categorySidebar.addEventListener("click", (event) => {
        const target = event.target.closest("[data-category]")
        if (!target) return

        const category = target.getAttribute("data-category")
        if (category !== "all" && category !== "work" && category !== "personal") return

        activeCategoryFilter = category
        filterCategorySelect.value = category
        syncSidebarActiveState()
        renderTasks()
    })

    searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value
        renderTasks()
    })

    filterCategorySelect.addEventListener("change", () => {
        const v = filterCategorySelect.value
        if (v !== "all" && v !== "work" && v !== "personal") return
        activeCategoryFilter = v
        syncSidebarActiveState()
        renderTasks()
    })

    filterPrioritySelect.addEventListener("change", () => {
        const v = filterPrioritySelect.value
        if (v !== "all" && v !== "low" && v !== "medium" && v !== "high") return
        activePriorityFilter = v
        renderTasks()
    })
}

initializeFilters()
initializeThemeFromStorage()
syncSidebarActiveState()
renderTasks()

/* DARK MODE */

const darkModeToggleButton = document.getElementById("toggleDark")

/**
 * Carga el tema (light/dark) desde localStorage y lo aplica.
 */
function initializeThemeFromStorage() {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark")
    } else if (savedTheme === "light") {
        document.documentElement.classList.remove("dark")
    }
}

/**
 * Alterna el modo oscuro y guarda la preferencia.
 */
function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", isDark ? "dark" : "light")
}

darkModeToggleButton.addEventListener("click", toggleDarkMode)
