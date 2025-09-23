const apiUrl = "http://localhost:8080/api/todos";
const todoList = document.getElementById("todoList");
const todoInput = document.getElementById("todoInput");
const dueDateInput = document.getElementById("dueDateInput");
const searchInput = document.getElementById("searchInput");
const notificationBanner = document.getElementById("notificationBanner");
const welcomeMessage = document.getElementById("welcomeMessage");

// User info from localStorage
const userId = localStorage.getItem("userId");
const username = localStorage.getItem("username");

// Redirect if not logged in
if (!userId) {
  window.location.href = "login.html";
}

// Welcome message
if (welcomeMessage) {
  welcomeMessage.textContent = username
    ? `Welcome back, ${username}! 🎉`
    : "Welcome! Please log in.";
}

// Cache
let todosCache = [];

// Simple loading indicator
function showLoading() {
  todoList.innerHTML = `<li>Loading tasks...</li>`;
}

// Fetch tasks from backend
async function fetchTodos() {
  if (!userId) return;
  showLoading();
  try {
    const res = await fetch(`${apiUrl}/${userId}`);
    todosCache = await res.json();
    renderTodos(todosCache);
    updateNotifications();
  } catch (err) {
    console.error("Error fetching todos:", err);
    todoList.innerHTML = `<li style="color:red">Error loading tasks</li>`;
  }
}

// Render all todos
function renderTodos(todos) {
  todoList.innerHTML = "";
  todos.forEach(todo => renderTodo(todo));
}

// Render single todo
function renderTodo(todo) {
  const li = document.createElement("li");
  li.className = todo.completed ? "completed" : "";

  const createdAt = new Date(todo.createdAt).toLocaleString();
  const updatedAt = new Date(todo.updatedAt).toLocaleString();
  const dueDate = new Date(todo.dueDate);

  const now = new Date();
  let dueStatus = "";
  let dueClass = "due-normal";

  if (dueDate < now && !todo.completed) {
    dueStatus = "⚠️ Overdue!";
    dueClass = "due-overdue";
  } else {
    const timeDiff = dueDate - now;
    const oneHour = 60 * 60 * 1000;
    if (timeDiff <= oneHour && timeDiff > 0 && !todo.completed) {
      dueStatus = "⏳ Due soon!";
      dueClass = "due-soon";
    }
  }

  li.innerHTML = `
  <span>
    <strong class="task-name">${todo.task}</strong>
    <br><small>Created: ${createdAt}</small>
    <br><small>Updated: ${updatedAt}</small>
    <br><small>Due: <span class="${dueClass}">${dueDate.toLocaleString()} ${dueStatus}</span></small>
  </span>
  <div>
    <input type="checkbox" ${todo.completed ? "checked" : ""} 
      onchange="toggleComplete('${todo.id}', this.checked)">
    <button class="btn warning" onclick="editTask('${todo.id}', '${todo.task}')">Edit</button>
    <button class="btn danger" onclick="deleteTodo('${todo.id}')">Delete</button>
  </div>
`;
  todoList.appendChild(li);
}

// Add task
async function addTodo() {
  const task = todoInput.value.trim();
  const dueDate = dueDateInput.value;
  if (!task || !userId || !dueDate) return;

  try {
    const res = await fetch(`${apiUrl}/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, completed: false, dueDate })
    });
    const newTodo = await res.json();
    todosCache.push(newTodo);
    renderTodos(todosCache);
    updateNotifications();
    todoInput.value = "";
    dueDateInput.value = "";
  } catch (err) {
    console.error("Error adding todo:", err);
  }
}

// Toggle complete
async function toggleComplete(id, completed) {
  try {
    const res = await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed })
    });
    const updatedTodo = await res.json();
    todosCache = todosCache.map(todo =>
      todo.id === id
        ? { ...todo, completed: updatedTodo.completed, updatedAt: updatedTodo.updatedAt }
        : todo
    );
    renderTodos(todosCache);
    updateNotifications();
  } catch (err) {
    console.error("Error updating todo:", err);
  }
}

// Delete
async function deleteTodo(id) {
  try {
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    todosCache = todosCache.filter(todo => todo.id !== id);
    renderTodos(todosCache);
    updateNotifications();
  } catch (err) {
    console.error("Error deleting todo:", err);
  }
}

// Edit task (partial update)
async function editTask(id, oldTask) {
  const newTask = prompt("✏️ Edit your task:", oldTask);
  if (!newTask || newTask.trim() === "" || newTask === oldTask) return;

  try {
    const res = await fetch(`${apiUrl}/${id}/task`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: newTask })
    });

    if (!res.ok) throw new Error("Failed to update task");

    const updatedTodo = await res.json();

    // update cache with new task
    todosCache = todosCache.map(todo =>
      todo.id === id ? updatedTodo : todo
    );

    renderTodos(todosCache);
  } catch (err) {
    console.error("Error editing task:", err);
    alert("❌ Could not update task");
  }
}


// Search (client-side)
function searchTodos() {
  const query = searchInput.value.toLowerCase();
  const filtered = todosCache.filter(todo =>
    todo.task.toLowerCase().includes(query)
  );
  renderTodos(filtered);
}

// Filters
function filterTodos(type) {
  const now = new Date();
  let filtered;
  switch (type) {
    case "pending":
      filtered = todosCache.filter(todo => !todo.completed);
      break;
    case "completed":
      filtered = todosCache.filter(todo => todo.completed);
      break;
    case "dueSoon":
      filtered = todosCache.filter(todo => {
        const dueDate = new Date(todo.dueDate);
        const diff = dueDate - now;
        return !todo.completed && diff > 0 && diff <= 60 * 60 * 1000;
      });
      break;
    case "overdue":
      filtered = todosCache.filter(todo => !todo.completed && new Date(todo.dueDate) < now);
      break;
    default:
      filtered = todosCache;
  }
  renderTodos(filtered);
}

// Notifications
function updateNotifications() {
  const now = new Date();
  const overdueCount = todosCache.filter(todo => !todo.completed && new Date(todo.dueDate) < now).length;
  const dueSoonCount = todosCache.filter(todo => {
    const dueDate = new Date(todo.dueDate);
    const diff = dueDate - now;
    return !todo.completed && diff > 0 && diff <= 60 * 60 * 1000;
  }).length;

  if (overdueCount > 0 || dueSoonCount > 0) {
    notificationBanner.style.display = "block";
    notificationBanner.textContent =
      `⚠️ You have ${overdueCount} overdue and ${dueSoonCount} due soon tasks!`;
  } else {
    notificationBanner.style.display = "none";
  }
}


// Logout
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ✅ Fetch todos automatically on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchTodos();
});
