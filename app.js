const taskForm = document.getElementById("taskForm")
const taskInput = document.getElementById("taskInput")
const prioritySelect = document.getElementById("priority")
const taskListContainer = document.getElementById("taskList")

/**
 * @typedef {"low" | "medium" | "high"} TaskPriority
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Identificador único de la tarea
 * @property {string} text - Descripción de la tarea
 * @property {TaskPriority} priority - Prioridad de la tarea
 */

/** @type {Task[]} */
let tasks = loadTasksFromStorage()

/**
 * Carga las tareas desde localStorage.
 * @returns {Task[]}
 */
function loadTasksFromStorage() {
    try {
        const stored = localStorage.getItem("tasks")
        if (!stored) return []
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
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
  <span class="text-sm text-gray-500">${formatPriorityLabel(task.priority)}</span>
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
 * Limpia y vuelve a pintar la lista de tareas.
 */
function renderTasks() {
    taskListContainer.innerHTML = ""

    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index)
        taskListContainer.appendChild(taskElement)
    })
}

/**
 * Valida el formulario de creación de tarea.
 * @param {string} text
 * @param {TaskPriority} priority
 * @returns {{ valid: boolean, message?: string }}
 */
function validateTaskForm(text, priority) {
    if (!text.trim()) {
        return { valid: false, message: "La descripción de la tarea es obligatoria." }
    }

    if (text.length > 120) {
        return {
            valid: false,
            message: "La descripción de la tarea no puede superar los 120 caracteres."
        }
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
 * @param {TaskPriority} priority
 */
function addTask(text, priority) {
    const newTask = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        text: text.trim(),
        priority
    }

    tasks.push(newTask)
    saveTasks(tasks)
    renderTasks()
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault()

    const text = taskInput.value
    const selectedPriority = /** @type {TaskPriority} */ (prioritySelect.value)

    const { valid, message } = validateTaskForm(text, selectedPriority)
    if (!valid) {
        alert(message)
        return
    }

    addTask(text, selectedPriority)
    taskInput.value = ""
})

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

initializeThemeFromStorage()

darkModeToggleButton.addEventListener("click", toggleDarkMode)
