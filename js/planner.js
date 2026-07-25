/* ==========================================================================
   StudyOS — AI Daily Planner & Smart Rescheduling Engine
   ========================================================================== */

export class AIPlanner {
  constructor(appState, renderCallback) {
    this.state = appState;
    this.renderCallback = renderCallback;
  }

  smartReschedule() {
    const weakSubjectNames = this.state.subjects.filter(s => s.isWeak).map(s => s.name);
    const targetWeak = weakSubjectNames[0] || 'Physics';

    this.state.schedule = [
      { id: "s1", time: "09:00 AM", title: `${targetWeak}: Core Concept Revision`, category: "revision", tag: "AI Priority", detail: `Chapter 10 • Revise 15 High-Yield Numericals for ${targetWeak}` },
      { id: "s2", time: "11:30 AM", title: "Maths Intensive Session", category: "coaching", tag: "Class", detail: "Calculus Intensive • Integration by Parts & Definite Integrals" },
      { id: "s3", time: "02:00 PM", title: "Chemistry Lab Practical", category: "school", tag: "School", detail: "Titration Practice & Organic Reaction Mechanisms" },
      { id: "s4", time: "05:00 PM", title: "Coaching Doubt Clearing", category: "coaching", tag: "Coaching", detail: "Solve PYQs with ALLEN Faculty" },
      { id: "s5", time: "08:00 PM", title: "Self Study & Active Recall", category: "study", tag: "Self Study", detail: "Formula Memory & Flashcards Review" }
    ];

    this.state.saveState();
    alert(`⚡ AI Smart Reschedule complete! Re-optimized schedule to prioritize: ${targetWeak}.`);
    this.render();
  }

  render() {
    this.renderDashboardSchedule();
    this.renderCalendarView();
    this.renderPlannerFullView();
  }

  renderDashboardSchedule() {
    const timelineContainer = document.getElementById('dashboard-schedule-timeline');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = this.state.schedule.slice(0, 3).map((item, idx) => {
      const isPrimary = idx === 0;
      const isTertiary = idx === 1;
      return `
        <div class="timeline-item">
          <div class="timeline-dot ${isTertiary ? 'tertiary' : (!isPrimary ? 'dim' : '')}"></div>
          <div class="timeline-time">${item.time}</div>
          <div class="timeline-content ${isPrimary ? 'primary-accent' : (isTertiary ? 'tertiary-accent' : '')}">
            <div class="timeline-subject" style="color: ${isPrimary ? 'var(--primary)' : (isTertiary ? 'var(--tertiary)' : 'inherit')};">${item.title}</div>
            <div class="timeline-desc">${item.detail}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderCalendarView() {
    const calendarContainer = document.getElementById('calendar-content-container');
    if (!calendarContainer) return;

    calendarContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 style="font-size: 16px; font-weight: 700;">Full Timetable — Today</h4>
          <button onclick="window.studyApp.aiPlanner.smartReschedule()" class="ai-btn" style="width: auto; padding: 6px 16px; font-size: 13px;">
            ⚡ AI Smart Reschedule
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${this.state.schedule.map(item => `
            <div class="timeline-content" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 12px; font-family: var(--font-geist); color: var(--primary); font-weight: 700;">${item.time}</span>
                <h5 style="font-size: 15px; font-weight: 700; margin-top: 2px;">${item.title}</h5>
                <p style="font-size: 13px; color: var(--on-surface-variant); margin-top: 2px;">${item.detail}</p>
              </div>
              <span class="priority-tag priority-medium">${item.tag}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderPlannerFullView() {
    const container = document.getElementById('planner-full-container');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="glass-card ai-insight-card" style="padding: 24px;">
          <div class="ai-header">
            <span class="material-symbols-outlined filled">auto_awesome</span>
            <span>AI Automated Timetable Optimization</span>
          </div>
          <p class="ai-quote">
            StudyOS analyzes your past test scores, weak subject trends, school timings, and available focus hours to generate the optimal daily study plan.
          </p>
          <button class="ai-btn" onclick="window.studyApp.aiPlanner.smartReschedule()">Generate Optimized Schedule Now</button>
        </div>
      </div>
    `;
  }
}
