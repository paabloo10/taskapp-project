const allowedCategories = new Set(["work", "personal"]);
const allowedPriorities = new Set(["low", "medium", "high"]);

function validateCreateTask(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return ["El cuerpo debe ser un objeto JSON valido."];
  }

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

  if (!payload || typeof payload !== "object") {
    return ["El cuerpo debe ser un objeto JSON valido."];
  }

  const hasKnownField =
    Object.prototype.hasOwnProperty.call(payload, "text") ||
    Object.prototype.hasOwnProperty.call(payload, "category") ||
    Object.prototype.hasOwnProperty.call(payload, "priority") ||
    Object.prototype.hasOwnProperty.call(payload, "completed");

  if (!hasKnownField) {
    errors.push("Debes enviar al menos un campo actualizable.");
    return errors;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "text")) {
    if (typeof payload.text !== "string" || payload.text.trim().length === 0) {
      errors.push("`text` debe ser un string no vacio.");
    } else if (payload.text.trim().length > 120) {
      errors.push("`text` no puede superar 120 caracteres.");
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "category") &&
    !allowedCategories.has(payload.category)
  ) {
    errors.push("`category` debe ser `work` o `personal`.");
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "priority") &&
    !allowedPriorities.has(payload.priority)
  ) {
    errors.push("`priority` debe ser `low`, `medium` o `high`.");
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "completed") &&
    typeof payload.completed !== "boolean"
  ) {
    errors.push("`completed` debe ser booleano.");
  }

  return errors;
}

function normalizeTaskInput(payload) {
  return {
    text: payload.text.trim(),
    category: payload.category,
    priority: payload.priority,
  };
}

function normalizeTaskPatch(payload) {
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(payload, "text")) {
    patch.text = payload.text.trim();
  }
  if (Object.prototype.hasOwnProperty.call(payload, "category")) {
    patch.category = payload.category;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "priority")) {
    patch.priority = payload.priority;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "completed")) {
    patch.completed = payload.completed;
  }
  return patch;
}

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  normalizeTaskInput,
  normalizeTaskPatch,
};
