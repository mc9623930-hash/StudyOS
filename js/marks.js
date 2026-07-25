/* ==========================================================================
   StudyOS — Marks Tracker & Weak Subject Analytics Module
   ========================================================================== */

export class MarksTracker {
  constructor(appState, updateCallback) {
    this.state = appState;
    this.updateCallback = updateCallback;
  }

  logExamMark(examData) {
    const newExam = {
      id: 'e_' + Date.now(),
      examName: examData.examName,
      subject: examData.subject,
      scored: parseFloat(examData.scored),
      total: parseFloat(examData.total || 100),
      date: examData.date || new Date().toISOString().split('T')[0]
    };

    this.state.exams.unshift(newExam);
    this.recalculateSubjectAverages();
    this.state.saveState();
    this.render();
  }

  recalculateSubjectAverages() {
    this.state.subjects.forEach(subject => {
      const subjectExams = this.state.exams.filter(e => e.subject.toLowerCase() === subject.name.toLowerCase());
      if (subjectExams.length > 0) {
        const totalPercentage = subjectExams.reduce((sum, e) => sum + (e.scored / e.total * 100), 0);
        subject.currentAvg = Math.round(totalPercentage / subjectExams.length);
        subject.isWeak = subject.currentAvg < (subject.target - 15);
      }
    });
  }

  deleteExam(examId) {
    this.state.exams = this.state.exams.filter(e => e.id !== examId);
    this.state.saveState();
    this.render();
  }

  render() {
    this.recalculateSubjectAverages();
    
    const container = document.getElementById('marks-full-container');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
          ${this.state.subjects.map(sub => `
            <div class="glass-card" style="padding: 20px; border-top: 3px solid ${sub.color}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div>
                  <h4 style="font-size: 16px; font-weight: 700;">${sub.name}</h4>
                  <p style="font-size: 12px; color: var(--on-surface-variant); font-family: var(--font-geist);">${sub.teacher}</p>
                </div>
                <span class="priority-tag ${sub.isWeak ? 'priority-high' : 'priority-medium'}">${sub.isWeak ? 'Weak Area' : 'On Track'}</span>
              </div>
              <div style="margin-top: 14px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-geist); margin-bottom: 4px;">
                  <span>Current Avg: <strong style="color: var(--on-surface); font-size: 14px;">${sub.currentAvg}%</strong></span>
                  <span>Target: ${sub.target}%</span>
                </div>
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                  <div style="width: ${sub.currentAvg}%; height: 100%; background: ${sub.color}; border-radius: 4px;"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="glass-card" style="padding: 24px;">
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Exams & Test Score History</h4>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--glass-border); color: var(--on-surface-variant); font-family: var(--font-geist); font-size: 12px;">
                <th style="padding: 10px;">Exam Name</th>
                <th style="padding: 10px;">Subject</th>
                <th style="padding: 10px;">Date</th>
                <th style="padding: 10px;">Score</th>
                <th style="padding: 10px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${this.state.exams.map(exam => {
                const percentage = Math.round((exam.scored / exam.total) * 100);
                return `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px 10px; font-weight: 600;">${exam.examName}</td>
                    <td style="padding: 12px 10px;"><span class="priority-tag priority-medium">${exam.subject}</span></td>
                    <td style="padding: 12px 10px; font-family: var(--font-geist); color: var(--on-surface-variant);">${exam.date}</td>
                    <td style="padding: 12px 10px; font-weight: 700; color: ${percentage < 75 ? 'var(--error)' : 'var(--tertiary)'};">${exam.scored} / ${exam.total} (${percentage}%)</td>
                    <td style="padding: 12px 10px; text-align: right;">
                      <button onclick="window.studyApp.marksTracker.deleteExam('${exam.id}')" style="background: none; border: none; color: var(--error); cursor: pointer;" title="Delete">
                        <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

      </div>
    `;

    if (this.updateCallback) this.updateCallback();
  }
}
