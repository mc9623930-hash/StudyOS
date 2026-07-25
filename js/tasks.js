/* ==========================================================================
   StudyOS — Task Manager Module
   ========================================================================== */

import confetti from 'canvas-confetti';

export class TaskManager {
  constructor(appState, renderCallback) {
    this.state = appState;
    this.renderCallback = renderCallback;
    this.currentFilter = 'all';
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.render();
  }

  addTask(taskData) {
    const newTask = {
      id: 't_' + Date.now(),
      title: taskData.title,
      subject: taskData.subject || 'General',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || 'Today',
      completed: false
    };
    this.state.tasks.unshift(newTask);
    this.state.saveState();
    this.render();
    if (this.renderCallback) this.renderCallback();
  }

  toggleTask(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.75 }
          });
        } catch (e) {
          console.log('Task completed confetti');
        }
      }
      this.state.saveState();
      this.render();
      if (this.renderCallback) this.renderCallback();
    }
  }

  deleteTask(taskId) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
    this.state.saveState();
    this.render();
    if (this.renderCallback) this.renderCallback();
  }

  getFilteredTasks() {
    if (this.currentFilter === 'active') {
      return this.state.tasks.filter(t => !t.completed);
    }
    if (this.currentFilter === 'completed') {
      return this.state.tasks.filter(t => t.completed);
    }
    return this.state.tasks;
  }

  render() {
    this.renderDashboardTasks();
    this.renderFullTasks();
  }

  renderDashboardTasks() {
    const dashList = document.getElementById('dashboard-tasks-list');
    const counterEl = document.getElementById('dashboard-task-counter');
    if (!dashList) return;

    const completedCount = this.state.tasks.filter(t => t.completed).length;
    if (counterEl) {
      counterEl.innerText = `${completedCount}/${this.state.tasks.length} Done`;
    }

    if (this.state.tasks.length === 0) {
      dashList.innerHTML = `<li class="task-item"><span class="task-title" style="color: var(--on-surface-variant);">No focus tasks set. Click + Add Custom Task!</span></li>`;
      return;
    }

    dashList.innerHTML = this.state.tasks.slice(0, 5).map(task => `
      <li class="task-item ${task.completed ? 'completed' : ''}" onclick="window.studyApp.taskManager.toggleTask('${task.id}')">
        <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="event.stopPropagation(); window.studyApp.taskManager.toggleTask('${task.id}')" />
        <span class="task-title">${task.title}</span>
        <span class="priority-tag priority-${task.priority}">${task.priority}</span>
        <button onclick="event.stopPropagation(); window.studyApp.taskManager.deleteTask('${task.id}')" style="background: none; border: none; color: var(--on-surface-variant); cursor: pointer;" title="Delete">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        </button>
      </li>
    `).join('');
  }

  renderFullTasks() {
    const container = document.getElementById('tasks-full-container');
    if (!container) return;

    const filtered = this.getFilteredTasks();

    container.innerHTML = `
      <div style="display: flex; gap: 12px; margin-bottom: 20px;">
        <button onclick="window.studyApp.taskManager.setFilter('all')" class="btn-timer-secondary" style="padding: 6px 16px; font-size: 13px; ${this.currentFilter==='all'?'background: var(--primary-container); color: var(--on-primary-container);':''}">All (${this.state.tasks.length})</button>
        <button onclick="window.studyApp.taskManager.setFilter('active')" class="btn-timer-secondary" style="padding: 6px 16px; font-size: 13px; ${this.currentFilter==='active'?'background: var(--primary-container); color: var(--on-primary-container);':''}">Active</button>
        <button onclick="window.studyApp.taskManager.setFilter('completed')" class="btn-timer-secondary" style="padding: 6px 16px; font-size: 13px; ${this.currentFilter==='completed'?'background: var(--primary-container); color: var(--on-primary-container);':''}">Completed</button>
      </div>

      <ul class="tasks-list">
        ${filtered.map(task => `
          <li class="task-item ${task.completed ? 'completed' : ''}" onclick="window.studyApp.taskManager.toggleTask('${task.id}')">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="event.stopPropagation(); window.studyApp.taskManager.toggleTask('${task.id}')" />
            <div style="flex: 1;">
              <span class="task-title" style="font-weight: 600;">${task.title}</span>
              <div style="font-size: 12px; color: var(--on-surface-variant); margin-top: 4px; font-family: var(--font-geist);">Subject: ${task.subject} • Due: ${task.dueDate}</div>
            </div>
            <span class="priority-tag priority-${task.priority}">${task.priority}</span>
            <button onclick="event.stopPropagation(); window.studyApp.taskManager.deleteTask('${task.id}')" style="background: none; border: none; color: var(--error); cursor: pointer; padding: 4px;" title="Delete">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </li>
        `).join('')}
      </ul>
    `;
  }
}
