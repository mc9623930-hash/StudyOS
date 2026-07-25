/* ==========================================================================
   StudyOS — Main Application Controller & State Manager (Stitch & Supabase)
   ========================================================================== */

import '../css/styles.css';
import { initialStudentData } from './mockData.js';
import { TaskManager } from './tasks.js';
import { StudyTimer } from './timer.js';
import { MarksTracker } from './marks.js';
import { AnalyticsEngine } from './analytics.js';
import { AIPlanner } from './planner.js';
import { RevisionEngine } from './revision.js';
import { OnboardingWizard } from './onboarding.js';
import { SettingsManager } from './settings.js';
import { AIAssistant } from './aiAssistant.js';
import { 
  signUpUser, 
  signInUser, 
  signOutUser, 
  getCurrentUser, 
  loadUserDataFromSupabase,
  saveProfileToSupabase,
  saveTaskToSupabase,
  saveTimerLogToSupabase
} from './supabase.js';

class StudyApp {
  constructor() {
    this.currentUser = null;
    this.loadState();
    
    // Initialize Submodules
    this.taskManager = new TaskManager(this, () => this.updateOverviewStats());
    this.studyTimer = new StudyTimer(this, () => this.updateOverviewStats());
    this.marksTracker = new MarksTracker(this, () => this.updateOverviewStats());
    this.analyticsEngine = new AnalyticsEngine(this);
    this.aiPlanner = new AIPlanner(this, () => this.updateOverviewStats());
    this.revisionEngine = new RevisionEngine(this);
    this.onboardingWizard = new OnboardingWizard(this, () => this.onProfileUpdated());
    this.settingsManager = new SettingsManager(this);
    this.aiAssistant = new AIAssistant(this);

    this.currentView = 'dashboard';
  }

  loadState() {
    const saved = localStorage.getItem('study_os_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.profile = parsed.profile || { name: '', grade: '', targetExam: '', dailyHours: 6, onboarded: false };
        this.subjects = parsed.subjects || [];
        this.schedule = parsed.schedule || [];
        this.tasks = parsed.tasks || [];
        this.exams = parsed.exams || [];
        this.timerLogs = parsed.timerLogs || [];
        return;
      } catch (e) {
        console.error('Error loading saved state, resetting to defaults', e);
      }
    }
    
    // Default to clean blank slate (no hardcoded pre-existing student names)
    this.profile = { name: '', grade: '', targetExam: '', dailyHours: 6, onboarded: false };
    this.subjects = [];
    this.schedule = [];
    this.tasks = [];
    this.exams = [];
    this.timerLogs = [];
  }

  saveState() {
    const payload = {
      profile: this.profile,
      subjects: this.subjects,
      schedule: this.schedule,
      tasks: this.tasks,
      exams: this.exams,
      timerLogs: this.timerLogs
    };
    localStorage.setItem('study_os_data', JSON.stringify(payload));

    // Async sync with Supabase if logged in
    if (this.currentUser && this.currentUser.id) {
      saveProfileToSupabase(this.currentUser.id, this.profile);
    }
  }

  async init() {
    this.onboardingWizard.init();
    this.settingsManager.init();
    this.aiAssistant.init();
    this.bindNavigation();
    this.bindButtons();
    this.bindModals();
    this.bindAuthModal();
    this.updateStudentProfileUI();
    this.renderAllViews();

    // Start Stitch Splash Screen boot animation
    await this.runSplashBootAnimation();

    // Check Auth session
    await this.checkAuthSession();
  }

  async runSplashBootAnimation() {
    const progressBar = document.getElementById('splash-progress-bar');
    const progressPercent = document.getElementById('splash-progress-percent');
    const splashScreen = document.getElementById('splash-screen');

    if (!progressBar || !splashScreen) return;

    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          if (progressBar) progressBar.style.width = '100%';
          if (progressPercent) progressPercent.innerText = '100%';
          
          setTimeout(() => {
            splashScreen.classList.add('hidden');
            resolve();
          }, 400);
        } else {
          if (progressBar) progressBar.style.width = `${progress}%`;
          if (progressPercent) progressPercent.innerText = `${progress}%`;
        }
      }, 70);
    });
  }

  async checkAuthSession() {
    const user = await getCurrentUser();
    if (user) {
      this.currentUser = user;
      console.log('✅ User logged in via Supabase:', user.email);
      const dbData = await loadUserDataFromSupabase(user.id);
      if (dbData && dbData.profile && dbData.profile.onboarded) {
        this.profile = { ...this.profile, ...dbData.profile };
        if (dbData.tasks) this.tasks = dbData.tasks;
        this.saveState();
        this.updateStudentProfileUI();
        this.renderAllViews();
      } else {
        // First time login: launch Tutorial Carousel -> Setup Profile
        this.onboardingWizard.openTutorial();
      }
    } else {
      // Prompt Auth Modal
      const authModal = document.getElementById('auth-modal');
      if (authModal) authModal.classList.add('active');
    }
  }

  bindAuthModal() {
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const titleEl = document.getElementById('auth-modal-title');
    const subtitleEl = document.getElementById('auth-modal-subtitle');
    const nameField = document.getElementById('auth-name-field');
    const submitBtn = document.getElementById('auth-submit-btn');
    const authForm = document.getElementById('auth-form');
    const errorMsg = document.getElementById('auth-error-msg');
    const skipBtn = document.getElementById('auth-skip-btn');
    const authModal = document.getElementById('auth-modal');

    let mode = 'login'; // 'login' or 'signup'

    if (tabLogin && tabSignup) {
      tabLogin.addEventListener('click', () => {
        mode = 'login';
        tabLogin.style.background = 'var(--primary-container)';
        tabLogin.style.color = 'white';
        tabSignup.style.background = 'transparent';
        tabSignup.style.color = 'var(--on-surface-variant)';
        titleEl.innerText = 'Welcome to StudyOS';
        subtitleEl.innerText = 'Sign in to access your synced workstation.';
        nameField.style.display = 'none';
        submitBtn.innerText = 'Sign In';
        if (errorMsg) errorMsg.style.display = 'none';
      });

      tabSignup.addEventListener('click', () => {
        mode = 'signup';
        tabSignup.style.background = 'var(--primary-container)';
        tabSignup.style.color = 'white';
        tabLogin.style.background = 'transparent';
        tabLogin.style.color = 'var(--on-surface-variant)';
        titleEl.innerText = 'Create your Account';
        subtitleEl.innerText = 'Start your AI-powered study environment.';
        nameField.style.display = 'flex';
        submitBtn.innerText = 'Create Account';
        if (errorMsg) errorMsg.style.display = 'none';
      });
    }

    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email-input').value;
        const password = document.getElementById('auth-password-input').value;
        const name = document.getElementById('auth-name-input').value || '';

        submitBtn.disabled = true;
        submitBtn.innerText = mode === 'login' ? 'Signing in...' : 'Creating account...';
        if (errorMsg) errorMsg.style.display = 'none';

        if (mode === 'signup') {
          const { data, error } = await signUpUser(email, password, name);
          submitBtn.disabled = false;
          submitBtn.innerText = 'Create Account';

          if (error) {
            if (errorMsg) {
              errorMsg.innerText = error.message;
              errorMsg.style.display = 'block';
            }
          } else {
            this.currentUser = data.user;
            this.profile.name = name;
            this.saveState();
            this.updateStudentProfileUI();
            if (authModal) authModal.classList.remove('active');
            
            // Launch Tutorial Carousel for new account
            this.onboardingWizard.openTutorial();
          }
        } else {
          const { data, error } = await signInUser(email, password);
          submitBtn.disabled = false;
          submitBtn.innerText = 'Sign In';

          if (error) {
            if (errorMsg) {
              errorMsg.innerText = error.message;
              errorMsg.style.display = 'block';
            }
          } else {
            this.currentUser = data.user;
            const dbData = await loadUserDataFromSupabase(data.user.id);
            if (dbData && dbData.profile && dbData.profile.onboarded) {
              this.profile = { ...this.profile, ...dbData.profile };
              if (dbData.tasks) this.tasks = dbData.tasks;
            }
            this.saveState();
            this.updateStudentProfileUI();
            this.renderAllViews();
            if (authModal) authModal.classList.remove('active');

            if (!this.profile.onboarded) {
              this.onboardingWizard.openTutorial();
            }
          }
        }
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        if (authModal) authModal.classList.remove('active');
        if (!this.profile.onboarded) {
          this.onboardingWizard.openTutorial();
        }
      });
    }
  }

  onProfileUpdated() {
    this.updateStudentProfileUI();
    this.renderAllViews();
    this.saveState();
  }

  updateStudentProfileUI() {
    const p = this.profile;
    
    // Sidebar Profile Badge
    const nameEl = document.getElementById('user-name-display');
    const classEl = document.getElementById('user-class-display');
    const avatarEl = document.getElementById('user-avatar-initials');

    if (nameEl) nameEl.innerText = p.name || 'Set Profile';
    if (classEl) classEl.innerText = p.grade || 'Click Setup Profile';
    if (avatarEl) {
      const initials = (p.name || 'SO').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      avatarEl.innerText = initials || 'SO';
    }

    // Dashboard Greeting & Exam Countdown
    const greetTitle = document.getElementById('greeting-title');
    const greetSub = document.getElementById('greeting-subtitle');
    const countDays = document.getElementById('countdown-days');
    const countExam = document.getElementById('countdown-exam-name');

    if (greetTitle) greetTitle.innerText = `Good morning, ${p.name ? p.name.split(' ')[0] : 'Student'}.`;
    if (greetSub) greetSub.innerText = `Let me assist you today with your ${p.grade || 'studies'}. Your daily goal is ${p.dailyHours || 6}h.`;
    if (countDays) countDays.innerText = p.daysToExam || 60;
    if (countExam) countExam.innerText = `Days until ${p.targetExam || 'Exams'}`;

    // Populate Task & Exam Modal Subject Selects
    const taskSelect = document.getElementById('task-subject-input');
    const examSelect = document.getElementById('exam-subject-input');

    if (this.subjects && this.subjects.length > 0) {
      const optionsHtml = this.subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
      if (taskSelect) taskSelect.innerHTML = optionsHtml;
      if (examSelect) examSelect.innerHTML = optionsHtml;
    }
  }

  bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        this.switchView(targetView);
      });
    });
  }

  bindButtons() {
    // Setup Profile Trigger Button
    const setupBtn = document.getElementById('edit-profile-setup-btn');
    if (setupBtn) {
      setupBtn.addEventListener('click', () => this.onboardingWizard.openWizard());
    }

    // Quick Add Task triggers
    const addBtns = [
      document.getElementById('quick-add-task-btn'),
      document.getElementById('add-custom-task-trigger'),
      document.getElementById('tasks-page-add-btn')
    ];

    addBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.openModal('add-task-modal'));
      }
    });

    // Calendar triggers
    const calBtns = [
      document.getElementById('view-full-calendar-btn'),
      document.getElementById('header-calendar-btn')
    ];
    calBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.switchView('calendar'));
      }
    });

    // Dashboard Timer Widget Buttons
    const dashStart = document.getElementById('dash-timer-start-btn');
    if (dashStart) {
      dashStart.addEventListener('click', () => this.studyTimer.toggle());
    }

    const dashReset = document.getElementById('dash-timer-reset-btn');
    if (dashReset) {
      dashReset.addEventListener('click', () => this.studyTimer.reset());
    }

    // AI Review launch trigger
    const aiBtn = document.getElementById('launch-ai-review-btn');
    if (aiBtn) {
      aiBtn.addEventListener('click', () => {
        this.aiPlanner.smartReschedule();
        this.switchView('planner');
      });
    }
  }

  bindModals() {
    // Add Task Form Submit
    const taskForm = document.getElementById('add-task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title-input').value;
        const subject = document.getElementById('task-subject-input').value;
        const priority = document.getElementById('task-priority-input').value;
        const dueDate = document.getElementById('task-date-input').value;

        this.taskManager.addTask({ title, subject, priority, dueDate });
        this.closeModal('add-task-modal');
        taskForm.reset();
      });
    }

    // Log Exam Form Submit
    const examForm = document.getElementById('log-exam-form');
    if (examForm) {
      examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const examName = document.getElementById('exam-name-input').value;
        const subject = document.getElementById('exam-subject-input').value;
        const scored = document.getElementById('exam-score-input').value;
        const total = document.getElementById('exam-total-input').value;
        const date = document.getElementById('exam-date-input').value;

        this.marksTracker.logExamMark({ examName, subject, scored, total, date });
        this.closeModal('log-exam-modal');
        examForm.reset();
      });
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  openLogExamModal(subjectName) {
    const subjectSelect = document.getElementById('exam-subject-input');
    if (subjectSelect && subjectName) subjectSelect.value = subjectName;
    this.openModal('log-exam-modal');
  }

  switchView(viewName) {
    this.currentView = viewName;
    
    // Update nav items active class
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
        const icon = item.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.add('filled');
      } else {
        item.classList.remove('active');
        const icon = item.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.remove('filled');
      }
    });

    // Update view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      if (sec.id === `view-${viewName}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Refresh view specific components
    if (viewName === 'tasks') this.taskManager.render();
    if (viewName === 'timer') this.studyTimer.renderFullView();
    if (viewName === 'revision') this.revisionEngine.render();
    if (viewName === 'marks') this.marksTracker.render();
    if (viewName === 'analytics') this.analyticsEngine.render();
    if (viewName === 'dashboard') {
      this.aiPlanner.render();
      this.taskManager.render();
      this.analyticsEngine.render();
    }
  }

  updateOverviewStats() {
    this.taskManager.renderDashboardTasks();
    this.analyticsEngine.renderDashboardActivityChart();
    this.analyticsEngine.renderDashboardSyllabusList();
  }

  renderAllViews() {
    this.aiPlanner.render();
    this.taskManager.render();
    this.marksTracker.render();
    this.analyticsEngine.render();
    this.revisionEngine.render();
    this.studyTimer.updateDisplay();
    this.updateOverviewStats();
  }
}

// Global instance launcher
document.addEventListener('DOMContentLoaded', () => {
  window.studyApp = new StudyApp();
  window.studyApp.init();
});
