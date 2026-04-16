const { randomUUID } = require("crypto");

/** @typedef {"work" | "personal"} TaskCategory */
/** @typedef {"low" | "medium" | "high"} TaskPriority */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} text
 * @property {TaskCategory} category
 * @property {TaskPriority} priority
 * @property {boolean} completed
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/** @type {Task[]} */
const tasks = [];

function nowIso() {
  return new Date().toISOString();
}

function listTasks() {
  return [...tasks];
}

function getTaskById(id) {
  return tasks.find((task) => task.id === id) || null;
}

function createTask(input) {
  const timestamp = nowIso();
  const newTask = {
    id: randomUUID(),
    text: input.text,
    category: input.category,
    priority: input.priority,
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  tasks.push(newTask);
  return newTask;
}

function updateTask(id, patch) {
  const task = getTaskById(id);
  if (!task) return null;

  if (typeof patch.text === "string") task.text = patch.text;
  if (patch.category) task.category = patch.category;
  if (patch.priority) task.priority = patch.priority;
  if (typeof patch.completed === "boolean") task.completed = patch.completed;
  task.updatedAt = nowIso();
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
