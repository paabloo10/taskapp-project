async function run() {
  const base = "http://localhost:3001/api";
  const results = [];

  const push = async (name, response) => {
    const body = await response.text();
    results.push({ name, status: response.status, body });
  };

  await push("GET /health", await fetch(`${base}/health`));

  await push(
    "POST /tasks invalid",
    await fetch(`${base}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "", category: "work", priority: "high" }),
    }),
  );

  const createResponse = await fetch(`${base}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Preparar demo API", category: "work", priority: "high" }),
  });
  const createPayload = await createResponse.json();
  results.push({
    name: "POST /tasks valid",
    status: createResponse.status,
    body: JSON.stringify(createPayload),
  });

  const id = createPayload?.data?.id;
  if (!id) throw new Error("No se obtuvo ID al crear tarea.");

  await push(`GET /tasks/${id}`, await fetch(`${base}/tasks/${id}`));
  await push(
    `PATCH /tasks/${id}`,
    await fetch(`${base}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    }),
  );
  await push("GET /tasks?completed=true", await fetch(`${base}/tasks?completed=true`));
  await push(`DELETE /tasks/${id}`, await fetch(`${base}/tasks/${id}`, { method: "DELETE" }));
  await push(`GET deleted /tasks/${id}`, await fetch(`${base}/tasks/${id}`));

  for (const result of results) {
    console.log(`\n### ${result.name}\nSTATUS: ${result.status}\nBODY: ${result.body}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
