/* ==========================================================================
   StudyOS — Analytics & Visual Charts Generator
   ========================================================================== */

export class AnalyticsEngine {
  constructor(appState) {
    this.state = appState;
  }

  render() {
    this.renderDashboardActivityChart();
    this.renderDashboardSyllabusList();
    this.renderFullAnalyticsView();
  }

  renderDashboardActivityChart() {
    const chartContainer = document.getElementById('dashboard-activity-chart');
    if (!chartContainer) return;

    // Days mock data
    const days = [
      { day: 'Mon', hours: 4.0, isMax: false },
      { day: 'Tue', hours: 6.5, isMax: false },
      { day: 'Wed', hours: 8.5, isMax: true },
      { day: 'Thu', hours: 5.0, isMax: false },
      { day: 'Fri', hours: 7.5, isMax: false },
      { day: 'Sat', hours: 9.0, isMax: false },
      { day: 'Sun', hours: 3.0, isMax: false }
    ];

    const maxVal = Math.max(...days.map(d => d.hours));

    chartContainer.innerHTML = days.map(d => {
      const heightPercent = Math.round((d.hours / 10) * 100);
      return `
        <div class="bar-column">
          <div class="bar-wrapper ${d.isMax ? 'active' : ''}" style="height: ${heightPercent}%;">
            <span class="bar-tooltip">${d.hours}h</span>
          </div>
          <span class="bar-label ${d.isMax ? 'font-bold text-primary' : ''}">${d.day}</span>
        </div>
      `;
    }).join('');
  }

  renderDashboardSyllabusList() {
    const syllabusContainer = document.getElementById('dashboard-syllabus-list');
    if (!syllabusContainer) return;

    const subjectsProgress = [
      { name: "Physics", focus: "Modern Physics", progress: 75, color: "var(--primary)" },
      { name: "Chemistry", focus: "Organic Chem", progress: 60, color: "var(--tertiary)" },
      { name: "Maths", focus: "Probability", progress: 85, color: "var(--primary-container)" },
      { name: "English", focus: "Flamingo & Vistas", progress: 90, color: "var(--tertiary-container)" }
    ];

    syllabusContainer.innerHTML = subjectsProgress.map(s => {
      // Circumference for r=20 circle: 2 * PI * 20 = 125.66
      const offset = (125.66 * (1 - s.progress / 100)).toFixed(2);
      return `
        <div class="progress-subject-item">
          <div class="ring-box">
            <svg style="width: 100%; height: 100%; transform: rotate(-90deg);">
              <circle cx="22" cy="22" r="18" fill="transparent" stroke="rgba(255,255,255,0.1)" stroke-width="4"></circle>
              <circle cx="22" cy="22" r="18" fill="transparent" stroke="${s.color}" stroke-width="4" stroke-linecap="round" stroke-dasharray="113.1" stroke-dashoffset="${(113.1 * (1 - s.progress / 100)).toFixed(2)}"></circle>
            </svg>
            <span class="ring-percent">${s.progress}%</span>
          </div>
          <div class="subject-info">
            <h5>${s.name}</h5>
            <p>Focus: ${s.focus}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  renderFullAnalyticsView() {
    const container = document.getElementById('analytics-full-container');
    if (!container) return;

    // Aggregate timer log minutes per subject
    const subjectHours = {};
    this.state.subjects.forEach(s => subjectHours[s.name] = 0);
    this.state.timerLogs.forEach(log => {
      if (subjectHours[log.subject] !== undefined) {
        subjectHours[log.subject] += log.durationMins;
      } else {
        subjectHours[log.subject] = log.durationMins;
      }
    });

    const totalMins = Object.values(subjectHours).reduce((a, b) => a + b, 0) || 1;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
        
        <div class="glass-card" style="padding: 24px;">
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Study Distribution by Subject</h4>
          ${Object.entries(subjectHours).map(([sub, mins]) => {
            const pct = Math.round((mins / totalMins) * 100);
            return `
              <div style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                  <span>${sub}</span>
                  <span style="font-family: var(--font-geist); color: var(--on-surface-variant);">${mins} mins (${pct}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: var(--primary-container); border-radius: 4px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="glass-card" style="padding: 24px;">
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Weak Areas & Recommendations</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="padding: 14px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 12px;">
              <h5 style="color: #ff859b; font-weight: 700;">Physics — Wave Optics</h5>
              <p style="font-size: 13px; color: var(--on-surface-variant); margin-top: 4px;">Current Average: 68%. Focus on numerical practice for Huygens' Principle.</p>
            </div>
            <div style="padding: 14px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px;">
              <h5 style="color: #fbbf24; font-weight: 700;">Chemistry — Organic Reaction Mechanisms</h5>
              <p style="font-size: 13px; color: var(--on-surface-variant); margin-top: 4px;">Current Average: 72%. Schedule a 30-min reaction mechanism flashcard review.</p>
            </div>
          </div>
        </div>

      </div>
    `;
  }
}
