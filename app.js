const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");

let tasks = [];


/* CARGAR TAREAS AL INICIAR */

window.addEventListener("DOMContentLoaded", () => {

    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }

});


/* GUARDAR EN LOCALSTORAGE */

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


/* RENDERIZAR TAREAS */

function renderTasks() {

    taskList.innerHTML = "";

    tasks.forEach((task, index) => {

        const taskCard = document.createElement("div");
        taskCard.classList.add("task-card");

        taskCard.innerHTML = `

        <div class="task-info">
            <h3>${task}</h3>
        </div>

        <div class="task-meta">
            <button class="delete-btn" data-index="${index}">
            Eliminar
            </button>
        </div>

        `;

        taskList.appendChild(taskCard);

    });

}


/* AÑADIR TAREA */

taskForm.addEventListener("submit", function(e){

    e.preventDefault();

    const text = taskInput.value.trim();

    if(text === "") return;

    tasks.push(text);

    saveTasks();
    renderTasks();

    taskInput.value = "";

});


/* ELIMINAR TAREA */

taskList.addEventListener("click", function(e){

    if(e.target.classList.contains("delete-btn")){

        const index = e.target.dataset.index;

        tasks.splice(index,1);

        saveTasks();
        renderTasks();

    }

});


/* BUSCADOR (BONUS) */

searchInput.addEventListener("input", function(){

    const filter = searchInput.value.toLowerCase();

    const cards = document.querySelectorAll(".task-card");

    cards.forEach(card => {

        const text = card.textContent.toLowerCase();

        if(text.includes(filter)){
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }

    });

});
