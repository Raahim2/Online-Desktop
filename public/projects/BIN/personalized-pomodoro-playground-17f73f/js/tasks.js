let tasks = []; // Array to hold task objects { text: 'Task Name', completed: false, id: Date.now() }

// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task-button');
const taskList = document.getElementById('task-list');

function saveTasks() {
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
}

function renderTask(task) {
    const li = document.createElement('li');
    li.textContent = task.text;
    li.dataset.id = task.id; // Store unique ID
    li.classList.add('cursor-pointer', 'hover:text-blue-600', 'py-1', 'px-2', 'rounded', 'relative', 'group'); // Added padding/rounding/group for delete button

    if (task.completed) {
        li.classList.add('line-through', 'text-gray-500', 'hover:text-gray-600');
    }

    // Toggle completion on click
    li.addEventListener('click', () => {
        toggleTaskComplete(task.id);
    });

    // Add delete button (appears on hover)
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-times text-red-500 hover:text-red-700"></i>';
    deleteBtn.classList.add('absolute', 'right-1', 'top-1/2', '-translate-y-1/2', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'text-xs', 'p-1');
    deleteBtn.title = "Delete Task";
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent li click event when clicking delete
        deleteTask(task.id);
    });

    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

function loadTasks() {
    const storedTasks = localStorage.getItem('pomodoroTasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        taskList.innerHTML = ''; // Clear existing list before rendering
        tasks.forEach(task => renderTask(task));
    }
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') {
        return; // Don't add empty tasks
    }

    const newTask = {
        text: taskText,
        completed: false,
        id: Date.now() // Simple unique ID
    };

    tasks.push(newTask);
    renderTask(newTask);
    saveTasks();
    taskInput.value = ''; // Clear input field
    taskInput.focus(); // Keep focus on input
}

function toggleTaskComplete(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        // Re-render the specific task or the whole list
        const taskElement = taskList.querySelector(`li[data-id='${taskId}']`);
        if (taskElement) {
            taskElement.classList.toggle('line-through');
            taskElement.classList.toggle('text-gray-500');
            taskElement.classList.toggle('hover:text-gray-600');
             // Ensure base hover class is present if not completed
            if (!tasks[taskIndex].completed) {
                 taskElement.classList.add('hover:text-blue-600');
            } else {
                 taskElement.classList.remove('hover:text-blue-600');
            }
        }
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    // Remove from DOM
    const taskElement = taskList.querySelector(`li[data-id='${taskId}']`);
    if (taskElement) {
        taskElement.remove();
    }
}


function setupTaskControls() {
    if (!taskInput || !addTaskButton || !taskList) {
        console.error("Task control elements not found.");
        return;
    }

    loadTasks(); // Load tasks on initial setup

    addTaskButton.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });
}

// Make setupTaskControls globally accessible
window.setupTaskControls = setupTaskControls;