const form = document.getElementById("taskForm")
const input = document.getElementById("taskInput")
const priority = document.getElementById("priority")
const list = document.getElementById("taskList")

let tasks = JSON.parse(localStorage.getItem("tasks")) || []


function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}


function createTaskElement(task, index) {

    const card = document.createElement("div")

    card.className =
        "flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow"

    const badgeColors = {
        high: "bg-red-500",
        medium: "bg-amber-500",
        low: "bg-emerald-500"
    }

    card.innerHTML = `

<div class="flex flex-col">
<h3 class="font-semibold">${task.text}</h3>
<span class="text-sm text-gray-500">${task.priority}</span>
</div>

<div class="flex items-center gap-3">

<span class="text-white text-xs px-3 py-1 rounded-full ${badgeColors[task.priority]}">
${task.priority}
</span>

<button class="delete bg-red-500 text-white px-2 py-1 rounded">
X
</button>

</div>
`

    card.querySelector(".delete").addEventListener("click", () => {

        tasks.splice(index, 1)

        saveTasks()

        renderTasks()

    })

    return card

}


function renderTasks() {

    list.innerHTML = ""

    tasks.forEach((task, index) => {

        const el = createTaskElement(task, index)

        list.appendChild(el)

    })

}


form.addEventListener("submit", (e) => {

    e.preventDefault()

    const text = input.value.trim()

    if (!text) return

    const newTask = {
        text: text,
        priority: priority.value
    }

    tasks.push(newTask)

    saveTasks()

    renderTasks()

    input.value = ""

})


renderTasks()


/* DARK MODE */

const toggle = document.getElementById("toggleDark")

toggle.addEventListener("click", () => {

    document.documentElement.classList.toggle("dark")

})