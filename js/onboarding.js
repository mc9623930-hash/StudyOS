/* ==========================================================================
   StudyOS — Multi-Step Tutorial Carousel & Blank Profile Setup Wizard
   ========================================================================== */

function formatTime12h(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

export class OnboardingWizard {
  constructor(appState, saveCallback) {
    this.state = appState;
    this.saveCallback = saveCallback;
    this.currentStep = 1; // 1, 2, 3 in Profile setup
    this.tutorialSlide = 1; // 1, 2, 3, 4 in Tutorial carousel
    this.tempSubjects = [];
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Tutorial Carousel Navigation
    const nextBtn = document.getElementById('tutorial-next-btn');
    const prevBtn = document.getElementById('tutorial-prev-btn');

    if (nextBtn) {
      nextBtn.onclick = () => this.nextTutorialSlide();
    }
    if (prevBtn) {
      prevBtn.onclick = () => this.prevTutorialSlide();
    }

    // Add Subject Row button
    const addSubBtn = document.getElementById('add-subject-row-btn');
    if (addSubBtn) {
      addSubBtn.onclick = () => this.addSubjectRow();
    }
  }

  openTutorial() {
    const modal = document.getElementById('tutorial-modal');
    if (!modal) return;
    this.tutorialSlide = 1;
    this.renderTutorialSlide(1);
    modal.classList.add('active');
  }

  renderTutorialSlide(slideNum) {
    this.tutorialSlide = slideNum;
    const slides = document.querySelectorAll('.tutorial-slide');
    const dots = document.querySelectorAll('.tutorial-dot');
    const nextBtn = document.getElementById('tutorial-next-btn');
    const prevBtn = document.getElementById('tutorial-prev-btn');

    slides.forEach((slide, idx) => {
      slide.style.display = (idx + 1) === slideNum ? 'block' : 'none';
    });

    dots.forEach((dot, idx) => {
      if ((idx + 1) === slideNum) {
        dot.classList.add('active');
        dot.style.background = 'var(--primary-container)';
      } else {
        dot.classList.remove('active');
        dot.style.background = 'rgba(255, 255, 255, 0.2)';
      }
    });

    if (prevBtn) {
      prevBtn.style.visibility = slideNum === 1 ? 'hidden' : 'visible';
    }

    if (nextBtn) {
      if (slideNum === 4) {
        nextBtn.innerText = 'Get Started →';
        nextBtn.style.background = 'var(--tertiary-container)';
      } else {
        nextBtn.innerText = 'Next →';
        nextBtn.style.background = 'var(--primary-container)';
      }
    }
  }

  nextTutorialSlide() {
    if (this.tutorialSlide < 4) {
      this.renderTutorialSlide(this.tutorialSlide + 1);
    } else {
      // Done with Tutorial! Close Tutorial Modal and open Blank Profile Setup
      const tutorialModal = document.getElementById('tutorial-modal');
      if (tutorialModal) tutorialModal.classList.remove('active');
      this.openWizard();
    }
  }

  prevTutorialSlide() {
    if (this.tutorialSlide > 1) {
      this.renderTutorialSlide(this.tutorialSlide - 1);
    }
  }

  showStep(stepNum) {
    this.currentStep = stepNum;
    for (let i = 1; i <= 3; i++) {
      const stepEl = document.getElementById(`onboarding-step-${i}`);
      const indicatorEl = document.getElementById(`step-indicator-${i}`);
      if (stepEl) stepEl.style.display = i === stepNum ? 'block' : 'none';
      if (indicatorEl) {
        if (i === stepNum) {
          indicatorEl.style.background = 'var(--primary-container)';
          indicatorEl.style.color = 'var(--on-primary-container)';
        } else {
          indicatorEl.style.background = 'rgba(255, 255, 255, 0.1)';
          indicatorEl.style.color = 'var(--on-surface-variant)';
        }
      }
    }
  }

  addSubjectRow(name = '', teacher = '', target = 90) {
    const listEl = document.getElementById('onboarding-subjects-list');
    if (!listEl) return;

    const rowId = 'sub_row_' + Date.now();
    const div = document.createElement('div');
    div.id = rowId;
    div.style.cssText = 'display: grid; grid-template-columns: 2fr 2fr 1fr 40px; gap: 10px; align-items: center; margin-bottom: 10px;';
    div.innerHTML = `
      <input type="text" class="search-input sub-name" placeholder="Subject Name (e.g. Physics)" value="${name}" style="padding-left: 12px;" />
      <input type="text" class="search-input sub-teacher" placeholder="Teacher (e.g. Dr. Verma)" value="${teacher}" style="padding-left: 12px;" />
      <input type="number" class="search-input sub-target" placeholder="Target %" value="${target}" min="0" max="100" style="padding-left: 12px;" />
      <button type="button" onclick="document.getElementById('${rowId}').remove()" style="background: none; border: none; color: var(--error); cursor: pointer;" title="Remove">
        <span class="material-symbols-outlined">delete</span>
      </button>
    `;
    listEl.appendChild(div);
  }

  renderSubjectRows() {
    const listEl = document.getElementById('onboarding-subjects-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    if (this.state.subjects && this.state.subjects.length > 0) {
      this.state.subjects.forEach(sub => {
        this.addSubjectRow(sub.name, sub.teacher || '', sub.target || 90);
      });
    } else {
      // Clean starting blank rows
      this.addSubjectRow('', '', 90);
    }
  }

  openWizard() {
    const modal = document.getElementById('onboarding-modal');
    if (!modal) return;

    // Blank / fresh initial inputs (no dummy hardcoded Arjun Sharma)
    document.getElementById('setup-name-input').value = this.state.profile.name !== 'Student' ? (this.state.profile.name || '') : '';
    document.getElementById('setup-grade-input').value = this.state.profile.grade || '';
    document.getElementById('setup-exam-input').value = this.state.profile.targetExam || '';
    document.getElementById('setup-days-input').value = this.state.profile.daysToExam || 60;
    document.getElementById('setup-target-input').value = this.state.profile.targetScore || 90;

    this.renderSubjectRows();
    this.showStep(1);
    modal.classList.add('active');
  }

  completeWizard() {
    // Step 1 values
    const name = document.getElementById('setup-name-input').value.trim() || 'Student';
    const grade = document.getElementById('setup-grade-input').value.trim() || 'Class 12';
    const targetExam = document.getElementById('setup-exam-input').value.trim() || 'Final Exams';
    const daysToExam = parseInt(document.getElementById('setup-days-input').value) || 60;
    const targetScore = parseInt(document.getElementById('setup-target-input').value) || 90;

    // Step 2 subjects values
    const listEl = document.getElementById('onboarding-subjects-list');
    const newSubjects = [];
    if (listEl) {
      const rows = listEl.children;
      const colors = ["#b4c5ff", "#4ae176", "#2563eb", "#ffb4ab", "#6bff8f"];
      for (let i = 0; i < rows.length; i++) {
        const nameVal = rows[i].querySelector('.sub-name').value.trim();
        const teacherVal = rows[i].querySelector('.sub-teacher').value.trim();
        const targetVal = parseInt(rows[i].querySelector('.sub-target').value) || 90;
        
        if (nameVal) {
          newSubjects.push({
            id: 'sub_' + i,
            name: nameVal,
            teacher: teacherVal || 'Instructor',
            target: targetVal,
            currentAvg: targetVal - 5,
            isWeak: false,
            color: colors[i % colors.length]
          });
        }
      }
    }

    if (newSubjects.length === 0) {
      alert('Please add at least one subject!');
      return;
    }

    // Step 3 clock time values
    const schoolStart = document.getElementById('setup-school-start').value || '08:00';
    const schoolEnd = document.getElementById('setup-school-end').value || '14:00';
    const coachingStart = document.getElementById('setup-coaching-start').value || '15:30';
    const coachingEnd = document.getElementById('setup-coaching-end').value || '17:30';

    const schoolTime = `${formatTime12h(schoolStart)} - ${formatTime12h(schoolEnd)}`;
    const coachingTime = `${formatTime12h(coachingStart)} - ${formatTime12h(coachingEnd)}`;
    const dailyHours = parseFloat(document.getElementById('setup-hours-input').value) || 6;

    // Update app state with clean real user data
    this.state.profile = {
      name,
      grade,
      targetExam,
      daysToExam,
      targetScore,
      dailyHours,
      schoolTime,
      coachingTime,
      onboarded: true
    };

    this.state.subjects = newSubjects;
    this.state.saveState();

    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.classList.remove('active');

    if (this.saveCallback) this.saveCallback();
  }
}
