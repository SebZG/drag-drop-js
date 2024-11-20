document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const newTaskBtn = document.getElementById('new-task-btn');
    const taskDialog = document.getElementById('task-dialog');
    const editTaskDialog = document.getElementById('edit-task-dialog');
    const taskForm = document.getElementById('task-form');
    const editTaskForm = document.getElementById('edit-task-form');
    const taskList = document.querySelector('.task-list');
    const taskContainers = document.querySelectorAll('.task-container');

    console.log('DOM Elements:', {
        newTaskBtn,
        taskDialog,
        taskForm,
        taskList,
        taskContainers
    });

    let currentEditingTask = null;

    // Initialize Sortable for all containers
    const containers = [taskList, ...taskContainers];
    containers.forEach(container => {
        new Sortable(container, {
            group: 'shared',
            animation: 150,
            handle: '.task-drag-handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            delay: 100,
            delayOnTouchOnly: true,
            touchStartThreshold: 3,
            scroll: true,
            scrollSensitivity: 80,
            scrollSpeed: 3
        });
    });

    // Get destination container based on selection
    function getDestinationContainer(destination) {
        console.log('Getting container for destination:', destination);
        let container;
        
        switch(destination) {
            case 'list':
                container = taskList;
                break;
            case 'do':
                container = document.querySelector('.important-urgent .task-container');
                break;
            case 'schedule':
                container = document.querySelector('.important-notUrgent .task-container');
                break;
            case 'delegate':
                container = document.querySelector('.notImportant-urgent .task-container');
                break;
            case 'automate':
                container = document.querySelector('.notImportant-notUrgent .task-container');
                break;
            default:
                container = taskList;
        }
        
        console.log('Found container:', container);
        return container;
    }

    // Create a new task element
    function createTask(title, description = '') {
        console.log('Creating task:', { title, description });
        const task = document.createElement('div');
        task.className = 'task';
        task.innerHTML = `
            <div class="task-drag-handle">⋮⋮</div>
            <div class="task-content">
                <div class="task-title">${title}</div>
            </div>
            <button class="task-edit-btn" title="Edit Task">✎</button>
        `;

        // Store task data
        task.dataset.title = title;
        task.dataset.description = description || '';

        // Add click handler to edit button
        const editBtn = task.querySelector('.task-edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            openEditDialog(task);
        });

        console.log('Created task element:', task);
        return task;
    }

    // Open edit dialog for a task
    function openEditDialog(task) {
        if (!editTaskDialog) {
            console.error('Edit dialog not found');
            return;
        }

        currentEditingTask = task;
        const editTitleInput = document.getElementById('edit-task-title');
        const editDescInput = document.getElementById('edit-task-description');
        const editDestSelect = document.getElementById('edit-task-destination');

        if (!editTitleInput || !editDescInput || !editDestSelect) {
            console.error('Edit form elements not found');
            return;
        }

        // Set current values
        editTitleInput.value = task.dataset.title;
        editDescInput.value = task.dataset.description;

        // Set current container as selected
        let currentContainer = 'list';
        const containerElement = task.closest('.task-container');
        if (containerElement) {
            const quadrant = containerElement.closest('.quadrant');
            if (quadrant.classList.contains('important-urgent')) currentContainer = 'do';
            else if (quadrant.classList.contains('important-notUrgent')) currentContainer = 'schedule';
            else if (quadrant.classList.contains('notImportant-urgent')) currentContainer = 'delegate';
            else if (quadrant.classList.contains('notImportant-notUrgent')) currentContainer = 'automate';
        }
        editDestSelect.value = currentContainer;

        editTaskDialog.showModal();
    }

    // Handle new task button click
    if (newTaskBtn && taskDialog) {
        newTaskBtn.addEventListener('click', () => {
            console.log('New task button clicked');
            taskForm.reset();
            taskDialog.showModal();
        });
    }

    // Handle dialog cancels
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dialog = btn.closest('dialog');
            dialog.close();
            if (dialog === editTaskDialog) {
                currentEditingTask = null;
            }
        });
    });

    // Handle task deletion
    if (editTaskDialog) {
        const deleteBtn = editTaskDialog.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (currentEditingTask) {
                    currentEditingTask.remove();
                    editTaskDialog.close();
                    currentEditingTask = null;
                }
            });
        }
    }

    // Handle new task form submission
    if (taskForm) {
        taskForm.onsubmit = (e) => {
            console.log('Form submitted');
            e.preventDefault();
            
            const titleInput = document.getElementById('task-title');
            const descriptionInput = document.getElementById('task-description');
            const destinationSelect = document.getElementById('task-destination');
            
            console.log('Form elements:', { titleInput, descriptionInput, destinationSelect });
            
            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();
            const destination = destinationSelect.value;
            
            console.log('Form values:', { title, description, destination });

            if (title) {
                const task = createTask(title, description);
                const container = getDestinationContainer(destination);
                
                if (container) {
                    console.log('Appending task to container:', container);
                    container.appendChild(task);
                    taskForm.reset();
                    taskDialog.close();
                } else {
                    console.error('Container not found for destination:', destination);
                }
            }
            
            return false;
        };
    }

    // Handle edit task form submission
    if (editTaskForm) {
        editTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (currentEditingTask) {
                const titleInput = document.getElementById('edit-task-title');
                const descriptionInput = document.getElementById('edit-task-description');
                const destinationSelect = document.getElementById('edit-task-destination');
                
                const title = titleInput.value.trim();
                const description = descriptionInput.value.trim();
                const destination = destinationSelect.value;

                if (title) {
                    // Update task content
                    currentEditingTask.dataset.title = title;
                    currentEditingTask.dataset.description = description;
                    currentEditingTask.querySelector('.task-title').textContent = title;

                    // Move task if destination changed
                    const container = getDestinationContainer(destination);
                    if (container) {
                        container.appendChild(currentEditingTask);
                        editTaskForm.reset();
                        editTaskDialog.close();
                        currentEditingTask = null;
                    }
                }
            }
        });
    }
});