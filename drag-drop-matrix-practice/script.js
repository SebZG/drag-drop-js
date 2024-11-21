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
            scrollSensitivity: 10,
            scrollSpeed: 5,
            forceFallback: true,
            fallbackClass: 'sortable-drag'
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

    // Timer state
    let timerState = {
        minutes: 25,
        seconds: 0,
        isRunning: false,
        isFocusTime: true,
        focusTime: 25,
        breakTime: 5,
        currentRound: 1,
        totalRounds: 4,
        autoStartBreaks: true,
        autoStartRounds: true,
        showNotifications: true,
        timerInterval: null
    };

    function updateTimerDisplay() {
        document.getElementById('minutes').textContent = String(timerState.minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(timerState.seconds).padStart(2, '0');
        document.getElementById('timer-phase').textContent = timerState.isFocusTime ? 'Focus Time' : 'Break Time';
        document.getElementById('round-info').textContent = `Round ${timerState.currentRound}/${timerState.totalRounds}`;
    }

    function handlePhaseComplete() {
        console.log('Handling phase completion...');
        console.log('Current state:', {
            round: timerState.currentRound,
            totalRounds: timerState.totalRounds,
            isFocusTime: timerState.isFocusTime,
            autoStartBreaks: timerState.autoStartBreaks,
            autoStartRounds: timerState.autoStartRounds
        });
        
        if (timerState.isFocusTime) {
            // Focus time completed
            // Switch to break phase
            timerState.isFocusTime = false;
            timerState.minutes = timerState.breakTime;
            timerState.seconds = 0;
            updateTimerDisplay();
            
            // Show notification after state update
            playNotificationAndSound('focus');
            
            // Auto-start break if enabled
            if (timerState.autoStartBreaks) {
                console.log('Auto-starting break...');
                // Small delay to ensure UI updates first
                setTimeout(() => {
                    if (!timerState.isRunning) {
                        startTimer();
                    }
                }, 100);
            } else {
                timerState.isRunning = false;
                document.getElementById('start-timer').disabled = false;
                document.getElementById('pause-timer').disabled = true;
            }
        } else {
            // Break time completed
            // Increment round counter after break completes
            timerState.currentRound++;
            console.log(`Completed round ${timerState.currentRound - 1}, starting round ${timerState.currentRound}`);
            
            // Check if we've completed all rounds
            if (timerState.currentRound > timerState.totalRounds) {
                console.log('All rounds completed!');
                playNotificationAndSound('complete');
                resetTimer();
                return;
            }
            
            // Switch to focus phase
            timerState.isFocusTime = true;
            timerState.minutes = timerState.focusTime;
            timerState.seconds = 0;
            timerState.isRunning = false;
            updateTimerDisplay();
            
            // Show notification after state update
            playNotificationAndSound('break');
            
            // Auto-start next round if enabled
            if (timerState.autoStartRounds) {
                console.log('Auto-starting next round...');
                // Small delay to ensure UI updates first
                setTimeout(() => {
                    if (!timerState.isRunning) {
                        startTimer();
                    }
                }, 100);
            } else {
                // Reset button states for manual start of focus time
                document.getElementById('start-timer').disabled = false;
                document.getElementById('pause-timer').disabled = true;
            }
        }
    }

    function playNotificationAndSound(phase) {
        // Play sound if available
        const audio = document.getElementById('timer-sound');
        if (audio) {
            audio.play().catch(error => console.log('Error playing sound:', error));
        }

        // Show notification if enabled and permission is granted
        if (timerState.showNotifications && Notification.permission === "granted") {
            let title, message;
            
            switch(phase) {
                case 'focus':
                    if (timerState.currentRound === timerState.totalRounds) {
                        title = 'Final Focus Session Complete';
                        message = 'Final break session - Almost there!';
                    } else {
                        title = 'Focus Session Complete';
                        message = 'Time for a break';
                    }
                    break;
                case 'break':
                    title = 'Break Complete';
                    message = 'Time to focus';
                    break;
                case 'complete':
                    title = 'Congratulations!';
                    message = `You've completed all ${timerState.totalRounds} rounds!`;
                    break;
            }
            
            new Notification(title, {
                body: message,
                icon: '/path/to/icon.png'
            });
        }
    }

    function requestNotificationPermission() {
        if (timerState.showNotifications && "Notification" in window) {
            Notification.requestPermission().then(function (permission) {
                console.log('Notification permission:', permission);
            });
        }
    }

    function resetTimer() {
        console.log('Resetting timer...');
        clearInterval(timerState.timerInterval);
        timerState.isRunning = false;
        timerState.isFocusTime = true;
        timerState.minutes = timerState.focusTime;
        timerState.seconds = 0;
        timerState.currentRound = 1;
        document.getElementById('start-timer').disabled = false;
        document.getElementById('pause-timer').disabled = true;
        updateTimerDisplay();
        
        // Show completion notification if all rounds were completed
        if (timerState.currentRound > timerState.totalRounds) {
            if (Notification.permission === "granted") {
                new Notification('Congratulations!', {
                    body: 'You have completed all rounds!',
                    icon: '/path/to/icon.png'
                });
            }
        }
    }

    function startTimer() {
        if (!timerState.isRunning) {
            console.log(`Starting ${timerState.isFocusTime ? 'focus' : 'break'} timer for round ${timerState.currentRound}...`);
            timerState.isRunning = true;
            document.getElementById('start-timer').disabled = true;
            document.getElementById('pause-timer').disabled = false;
            
            timerState.timerInterval = setInterval(() => {
                if (timerState.minutes === 0 && timerState.seconds === 0) {
                    // Timer completed
                    console.log(`${timerState.isFocusTime ? 'Focus' : 'Break'} timer completed`);
                    clearInterval(timerState.timerInterval);
                    timerState.isRunning = false;
                    handlePhaseComplete();
                } else {
                    if (timerState.seconds === 0) {
                        timerState.minutes--;
                        timerState.seconds = 59;
                    } else {
                        timerState.seconds--;
                    }
                    updateTimerDisplay();
                }
            }, 1000);
        }
    }

    // Timer mode and settings handlers
    document.getElementById('settings-toggle').addEventListener('click', () => {
        const settingsPanel = document.getElementById('timer-common-settings');
        const customPanel = document.getElementById('custom-settings');
        
        if (settingsPanel.style.display === 'none') {
            settingsPanel.style.display = 'block';
            customPanel.style.display = 'none';
        } else {
            settingsPanel.style.display = 'none';
        }
    });

    document.getElementById('apply-settings').addEventListener('click', () => {
        const newRounds = parseInt(document.getElementById('rounds').value);
        const autoStartBreaks = document.getElementById('auto-start-breaks').checked;
        const autoStartRounds = document.getElementById('auto-start-rounds').checked;
        const showNotifications = document.getElementById('show-notifications').checked;
        
        if (newRounds !== timerState.totalRounds || 
            autoStartBreaks !== timerState.autoStartBreaks ||
            autoStartRounds !== timerState.autoStartRounds ||
            showNotifications !== timerState.showNotifications) {
            
            timerState.totalRounds = newRounds;
            timerState.autoStartBreaks = autoStartBreaks;
            timerState.autoStartRounds = autoStartRounds;
            timerState.showNotifications = showNotifications;
            
            // Request notification permission if notifications are enabled
            if (showNotifications) {
                requestNotificationPermission();
            }
            
            // Only reset if timer isn't running
            if (!timerState.isRunning) {
                resetTimer();
            }
            updateTimerDisplay();
        }
    });

    // Handle timer mode selection
    document.querySelectorAll('.timer-mode').forEach(button => {
        button.addEventListener('click', () => {
            if (button.id === 'custom-timer') {
                document.getElementById('custom-settings').style.display = 'block';
                document.getElementById('timer-common-settings').style.display = 'none';
            } else {
                document.getElementById('custom-settings').style.display = 'none';
                document.getElementById('timer-common-settings').style.display = 'none';
                document.querySelectorAll('.timer-mode').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                timerState.focusTime = parseInt(button.dataset.focus);
                timerState.breakTime = parseInt(button.dataset.break);
                resetTimer();
            }
        });
    });

    document.getElementById('apply-custom').addEventListener('click', () => {
        // Preserve current rounds and auto-start settings
        const currentRounds = timerState.totalRounds;
        const currentAutoStart = timerState.autoStartBreaks;
        
        timerState.focusTime = parseInt(document.getElementById('focus-time').value);
        timerState.breakTime = parseInt(document.getElementById('break-time').value);
        
        // Restore preserved settings
        timerState.totalRounds = currentRounds;
        timerState.autoStartBreaks = currentAutoStart;
        
        document.getElementById('custom-settings').style.display = 'none';
        document.querySelectorAll('.timer-mode').forEach(btn => btn.classList.remove('active'));
        document.getElementById('custom-timer').classList.add('active');
        
        resetTimer();
    });

    // Add timer control event listeners
    document.getElementById('start-timer').addEventListener('click', startTimer);
    document.getElementById('pause-timer').addEventListener('click', () => {
        clearInterval(timerState.timerInterval);
        timerState.isRunning = false;
        document.getElementById('start-timer').disabled = false;
        document.getElementById('pause-timer').disabled = true;
    });
    document.getElementById('reset-timer').addEventListener('click', resetTimer);

    // Request notification permission when the page loads
    if (timerState.showNotifications) {
        requestNotificationPermission();
    }

    // Initialize timer display and settings
    document.getElementById('rounds').value = timerState.totalRounds;
    document.getElementById('auto-start-breaks').checked = timerState.autoStartBreaks;
    document.getElementById('auto-start-rounds').checked = timerState.autoStartRounds;
    document.getElementById('show-notifications').checked = timerState.showNotifications;
    updateTimerDisplay();
});