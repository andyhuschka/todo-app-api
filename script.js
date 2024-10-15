let todos = [];
let filter = "all";

// Load todos from the API when the app starts
window.onload = () => {
  console.log("App started, loading todos from API...");
  loadTodosFromAPI();
};

// Event listener to add new todo
document.getElementById("add-todo-btn").addEventListener("click", addTodo);

// Event listeners for filter buttons
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    filter = e.target.getAttribute("data-filter");
    console.log("Filter set to:", filter);
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    renderTodos();
  });
});

// Event listener to remove completed todos
document
  .getElementById("remove-done-btn")
  .addEventListener("click", removeDoneTodos);

async function loadTodosFromAPI() {
  try {
    const response = await fetch("http://localhost:3000/todos");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    todos = data;
    console.log("Loaded todos from API:", todos);
    renderTodos();
  } catch (error) {
    console.error("Error fetching todos:", error);
  }
}

async function addTodo() {
  const todoInput = document.getElementById("todo-input");
  let description = todoInput.value.trim();

  console.log("Adding new todo:", description);

  if (
    description === "" ||
    todos.some(
      (todo) => todo.description.toLowerCase() === description.toLowerCase()
    )
  ) {
    alert("Todo cannot be empty or duplicate!");
    return;
  }

  const newTodo = { description: description, done: false };

  try {
    const response = await fetch("http://localhost:3000/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo),
    });

    if (!response.ok) {
      throw new Error("Failed to add todo");
    }

    const addedTodo = await response.json();
    todos.push(addedTodo);
    console.log("New Todo added:", addedTodo);
    renderTodos();
    todoInput.value = "";
  } catch (error) {
    console.error("Error adding todo:", error);
  }
}

function renderTodos() {
  const todoList = document.getElementById("todo-list");
  todoList.innerHTML = "";
  console.log("Rendering todos...");

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "open") return !todo.done;
    if (filter === "done") return todo.done;
  });

  console.log("Filtered Todos:", filteredTodos);

  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.classList.toggle("completed", todo.done);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggleTodoDone(todo.id));

    const description = document.createElement("span");
    description.textContent = todo.description;

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-btn");
    editButton.addEventListener("click", () => editTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(description);
    li.appendChild(editButton);
    todoList.appendChild(li);
  });
}

async function toggleTodoDone(id) {
  const todo = todos.find((todo) => todo.id === id);
  todo.done = !todo.done;
  console.log(`Todo with id ${id} marked as:`, todo.done ? "Done" : "Open");

  try {
    await fetch(`http://localhost:3000/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ done: todo.done }),
    });

    renderTodos();
  } catch (error) {
    console.error("Error updating todo:", error);
  }
}

async function removeDoneTodos() {
  console.log("Removing completed todos...");

  const completedTodos = todos.filter((todo) => todo.done);

  for (const todo of completedTodos) {
    try {
      await fetch(`http://localhost:3000/todos/${todo.id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error removing todo:", error);
    }
  }

  todos = todos.filter((todo) => !todo.done);
  renderTodos();
}

async function editTodo(id) {
  const todo = todos.find((todo) => todo.id === id);
  const newDescription = prompt("Edit your todo:", todo.description);

  if (newDescription !== null && newDescription.trim() !== "") {
    todo.description = newDescription.trim();
    console.log(`Todo with id ${id} updated to:`, newDescription);

    try {
      await fetch(`http://localhost:3000/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: newDescription }),
      });

      renderTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  } else {
    alert("Todo description cannot be empty!");
  }
}
