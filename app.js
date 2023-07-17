const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started working");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDbAndServer();

///write api///

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let query = "";
  let data = "";
  if (status !== undefined && priority === undefined) {
    query = `SELECT * FROM todo
      WHERE status LIKE "%${status}%";`;
    const statusFilterData = await db.all(query);
    response.send(statusFilterData);
  } else if (status === undefined && priority !== undefined) {
    query = `SELECT * FROM todo
      WHERE priority LIKE "%${priority}%";`;
    const statusFilterData = await db.all(query);
    response.send(statusFilterData);
  } else if (status !== undefined && priority !== undefined) {
    query = `SELECT * FROM todo
      WHERE priority LIKE "%${priority}%" AND status LIKE "%${status}%";`;
    const statusFilterData = await db.all(query);
    response.send(statusFilterData);
  } else if (
    search_q !== undefined &&
    status === undefined &&
    priority === undefined
  ) {
    query = `SELECT * FROM todo
      WHERE todo LIKE "%${search_q}%";`;
    const statusFilterData = await db.all(query);
    response.send(statusFilterData);
  }
});

///api-2 ///

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const idQuery = `SELECT * FROM todo
  WHERE id = ${todoId};`;
  const idData = await db.get(idQuery);
  response.send(idData);
});

///api-3///

app.post("/todos/", async (request, response) => {
  const newTodo = request.body;
  const { id, todo, priority, status } = newTodo;
  const addTodoQuery = `INSERT INTO todo(id, todo, priority, status)
    VALUES(${id}, "${todo}", "${priority}", "${status}");`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

///api-4///

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;

  if (status !== undefined) {
    const query = `UPDATE todo
      SET status = "${status}"
      WHERE id = ${todoId};`;

    await db.run(query);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    const query = `UPDATE todo
      SET priority = "${priority}"
      WHERE id = ${todoId};`;

    await db.run(query);
    response.send("Priority Updated");
  } else if (todo !== undefined) {
    const query = `UPDATE todo
      SET todo = "${todo}"
      WHERE id = ${todoId};`;

    await db.run(query);
    response.send("Todo Updated");
  }
});

///api-5///

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
