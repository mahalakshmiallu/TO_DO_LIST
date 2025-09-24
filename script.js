// script.js - Vanilla JS To-Do App (front-end only)

// DOM references
const newTaskInput = document.getElementById('new-task');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const remainingCount = document.getElementById('remaining-count');
const clearCompletedBtn = document.getElementById('clear-completed');

let tasks = []; // { id, text, completed }

// ---------- Persistence ----------
const STORAGE_KEY = 'vanilla_todo_tasks';

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    tasks = [];
    console.error('Could not parse tasks from localStorage', e);
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Utilities ----------
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

function render() {
  // clear list
  todoList.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = task.id;

    // left: checkbox + label / edit input
    const left = document.createElement('div');
    left.className = 'todo-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!task.completed;
    checkbox.setAttribute('aria-label', `Mark "${task.text}" complete`);
    checkbox.addEventListener('change', () => toggleComplete(task.id));

    const label = document.createElement('div');
    label.className = 'todo-label';
    label.textContent = task.text;
    if (task.completed) label.classList.add('completed');

    // enable editing on double click
    label.addEventListener('dblclick', () => startEdit(task.id, li, label));

    left.appendChild(checkbox);
    left.appendChild(label);

    // right: buttons
    const btns = document.createElement('div');
    btns.className = 'btns';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.textContent = 'Edit';
    editBtn.title = 'Edit task';
    editBtn.addEventListener('click', () => startEdit(task.id, li, label));

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn delete';
    delBtn.textContent = 'Delete';
    delBtn.title = 'Delete task';
    delBtn.addEventListener('click', () => removeTask(task.id));

    btns.appendChild(editBtn);
    btns.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(btns);

    todoList.appendChild(li);
  });

  updateCounts();
}

function updateCounts() {
  const remaining = tasks.filter(t=>!t.completed).length;
  remainingCount.textContent = remaining;
}

// ---------- Task operations ----------
function addTask(text) {
  const clean = text.trim();
  if (!clean) return;
  const newTask = { id: uid(), text: clean, completed: false };
  tasks.unshift(newTask); // newest on top
  saveTasks();
  render();
  newTaskInput.value = '';
  newTaskInput.focus();
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function toggleComplete(id) {
  tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

function startEdit(id, li, labelEl) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // Replace label with input
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = task.text;
  input.setAttribute('aria-label', 'Edit task');

  // when done (Enter or blur), save
  function finishEdit(save) {
    if (save) {
      const newText = input.value.trim();
      if (newText) {
        tasks = tasks.map(t => t.id === id ? {...t, text: newText} : t);
      }
      // if cleared text => remove
      else tasks = tasks.filter(t => t.id !== id);
      saveTasks();
    }
    render();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { finishEdit(true); }
    else if (e.key === 'Escape') { render(); } // cancel
  });

  input.addEventListener('blur', () => finishEdit(true));

  // swap in
  labelEl.replaceWith(input);
  input.focus();
  // move caret to end
  input.selectionStart = input.selectionEnd = input.value.length;
}

// ---------- Event listeners ----------
addBtn.addEventListener('click', () => addTask(newTaskInput.value));
newTaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask(newTaskInput.value);
});
clearCompletedBtn.addEventListener('click', clearCompleted);

// initialize
loadTasks();
render();

// expose to console for debugging if needed
window.__todo__ = {
  get tasks(){ return tasks },
  save: saveTasks,
  load: loadTasks,
  render
};
