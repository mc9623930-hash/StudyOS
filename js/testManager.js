/* ==========================================================================
   StudyOS — Syllabus-Based Test Upload & Assessment Engine
   ========================================================================== */

import { 
  saveSyllabusTestToSupabase, 
  fetchSyllabusTestsFromSupabase, 
  saveTestResultToSupabase, 
  fetchUserTestResultsFromSupabase 
} from './supabase.js';

export class TestManager {
  constructor(app) {
    this.app = app;
    this.tests = [];
    this.testResults = [];
    this.activeFilterSubject = 'all';

    // Test Taking State
    this.currentTest = null;
    this.currentQuestionIdx = 0;
    this.userAnswers = {}; // { qId: 'A' }
    this.testTimerInterval = null;
    this.testTimeLeftMins = 0;
    this.testTimeLeftSecs = 0;

    this.loadInitialTests();
  }

  async init() {
    await this.loadTests();
    this.render();
    this.bindEvents();
  }

  loadInitialTests() {
    const saved = localStorage.getItem('study_os_syllabus_tests');
    if (saved) {
      try {
        this.tests = JSON.parse(saved);
        return;
      } catch (e) {
        console.warn('Could not parse local syllabus tests:', e);
      }
    }

    // Default pre-populated syllabus tests curated for standard Indian curriculums (Class 12 & Class 10)
    this.tests = [
      {
        id: 'test_phy_electrostatics',
        title: 'Electrostatics & Electric Fields High-Yield Quiz',
        description: 'Comprehensive evaluation covering Coulomb law, electric flux, Gauss theorem, and potential difference.',
        grade: 'Class 12 • PCM',
        subject: 'Physics',
        chapter: 'Electrostatics',
        durationMins: 20,
        totalMarks: 20,
        createdAt: new Date().toISOString(),
        questions: [
          {
            id: 'q_phy_1',
            questionText: 'What is the electric field inside a hollow conducting sphere with total charge Q and radius R?',
            optionA: 'kQ / R²',
            optionB: 'Zero',
            optionC: '2kQ / R',
            optionD: 'Infinite',
            correctOption: 'B',
            explanation: 'According to Gauss Law, the net charge enclosed inside a hollow conductor is zero, so electric field E = 0 inside.',
            marks: 5,
            topic: 'Gauss Law'
          },
          {
            id: 'q_phy_2',
            questionText: 'The unit of Electric Permittivity of free space (ε₀) is:',
            optionA: 'C² N⁻¹ m⁻²',
            optionB: 'N m² C⁻²',
            optionC: 'C N m⁻¹',
            optionD: 'N C⁻¹ m⁻²',
            correctOption: 'A',
            explanation: 'From Coulomb Law F = (1 / 4πε₀) * (q₁q₂/r²), unit of ε₀ is C² N⁻¹ m⁻² (or Farad/meter).',
            marks: 5,
            topic: 'Coulomb Law'
          },
          {
            id: 'q_phy_3',
            questionText: 'Electric field lines always intersect equipotential surfaces at an angle of:',
            optionA: '0°',
            optionB: '45°',
            optionC: '90°',
            optionD: '180°',
            correctOption: 'C',
            explanation: 'Work done moving a charge along an equipotential surface is zero (dW = q E · dr = 0), hence E is perpendicular (90°) to the surface.',
            marks: 5,
            topic: 'Equipotential Surfaces'
          },
          {
            id: 'q_phy_4',
            questionText: 'If a dielectric slab of dielectric constant K = 5 is inserted between parallel plate capacitors, capacitance becomes:',
            optionA: 'Decreased by 5 times',
            optionB: 'Increased by 5 times',
            optionC: 'Remains unchanged',
            optionD: 'Becomes zero',
            correctOption: 'B',
            explanation: 'Capacitance C = K * C₀. Inserting dielectric constant K increases capacitance K times.',
            marks: 5,
            topic: 'Capacitors'
          }
        ]
      },
      {
        id: 'test_math_calculus',
        title: 'Integration & Differential Calculus Assessment',
        description: 'Targeted test on definite integrals, substitution method, and area under curves.',
        grade: 'Class 12 • PCM',
        subject: 'Mathematics',
        chapter: 'Calculus',
        durationMins: 25,
        totalMarks: 20,
        createdAt: new Date().toISOString(),
        questions: [
          {
            id: 'q_math_1',
            questionText: 'Evaluate ∫ (1 / x) dx for x > 0:',
            optionA: 'ln|x| + C',
            optionB: '-1 / x² + C',
            optionC: 'x² / 2 + C',
            optionD: 'eˣ + C',
            correctOption: 'A',
            explanation: 'The standard integral of 1/x is the natural logarithm ln|x| + C.',
            marks: 5,
            topic: 'Integration'
          },
          {
            id: 'q_math_2',
            questionText: 'What is the derivative of f(x) = sin(x²)?',
            optionA: 'cos(x²)',
            optionB: '2x cos(x²)',
            optionC: '-2x cos(x²)',
            optionD: '2 sin(x) cos(x)',
            correctOption: 'B',
            explanation: 'Using the Chain Rule: d/dx[sin(u)] = cos(u) * du/dx = cos(x²) * (2x).',
            marks: 5,
            topic: 'Chain Rule'
          },
          {
            id: 'q_math_3',
            questionText: 'The value of definite integral ∫₀^(π/2) cos(x) dx is:',
            optionA: '0',
            optionB: '1',
            optionC: 'π / 2',
            optionD: '2',
            correctOption: 'B',
            explanation: '[sin(x)]₀^(π/2) = sin(π/2) - sin(0) = 1 - 0 = 1.',
            marks: 5,
            topic: 'Definite Integrals'
          },
          {
            id: 'q_math_4',
            questionText: 'What is the order of the differential equation (d²y/dx²)³ + dy/dx + y = 0?',
            optionA: '1',
            optionB: '2',
            optionC: '3',
            optionD: '4',
            correctOption: 'B',
            explanation: 'The order is the highest derivative present in the equation, which is d²y/dx² (Order 2).',
            marks: 5,
            topic: 'Differential Equations'
          }
        ]
      },
      {
        id: 'test_chem_organic',
        title: 'Organic Chemistry: Haloalkanes & Reactions',
        description: 'Test your grasp on SN1/SN2 mechanisms, IUPAC nomenclature, and reagent actions.',
        grade: 'Class 12 • PCM',
        subject: 'Chemistry',
        chapter: 'Haloalkanes',
        durationMins: 15,
        totalMarks: 15,
        createdAt: new Date().toISOString(),
        questions: [
          {
            id: 'q_chem_1',
            questionText: 'Which alkyl halide undergoes SN1 reaction most rapidly?',
            optionA: 'Primary (1°)',
            optionB: 'Secondary (2°)',
            optionC: 'Tertiary (3°)',
            optionD: 'Methyl halide',
            correctOption: 'C',
            explanation: 'SN1 reaction rate depends on carbocation stability. Tertiary carbocations are most stable.',
            marks: 5,
            topic: 'Reaction Mechanisms'
          },
          {
            id: 'q_chem_2',
            questionText: 'Wurtz reaction involves reacting alkyl halides with:',
            optionA: 'Sodium metal in dry ether',
            optionB: 'Magnesium in dry ether',
            optionC: 'Zinc metal in water',
            optionD: 'Aqueous NaOH',
            correctOption: 'A',
            explanation: 'Wurtz reaction couples two alkyl halides using sodium (Na) in dry ether to yield higher alkanes.',
            marks: 5,
            topic: 'Name Reactions'
          },
          {
            id: 'q_chem_3',
            questionText: 'Reagent used to convert alcohol into alkyl chloride cleanly with SO₂ and HCl gases:',
            optionA: 'PCl₅',
            optionB: 'PCl₃',
            optionC: 'SOCl₂ (Thionyl chloride)',
            optionD: 'Concentrated HCl + ZnCl₂',
            correctOption: 'C',
            explanation: 'Darzen reaction using SOCl₂ yields pure alkyl chloride because SO₂ and HCl escape as gases.',
            marks: 5,
            topic: 'Reagents'
          }
        ]
      }
    ];

    this.saveTests();
  }

  saveTests() {
    localStorage.setItem('study_os_syllabus_tests', JSON.stringify(this.tests));
  }

  async loadTests() {
    const cloudTests = await fetchSyllabusTestsFromSupabase();
    if (cloudTests && cloudTests.length > 0) {
      // Merge cloud tests with local defaults
      const existingIds = new Set(this.tests.map(t => t.id));
      cloudTests.forEach(ct => {
        if (!existingIds.has(ct.id)) {
          this.tests.unshift({
            id: ct.id,
            title: ct.title,
            description: ct.description,
            grade: ct.grade,
            subject: ct.subject,
            chapter: ct.chapter,
            durationMins: ct.duration_mins,
            totalMarks: ct.total_marks,
            createdAt: ct.created_at,
            questions: (ct.questions || []).map(q => ({
              id: q.id,
              questionText: q.question_text,
              optionA: q.option_a,
              optionB: q.option_b,
              optionC: q.option_c,
              optionD: q.option_d,
              correctOption: q.correct_option,
              explanation: q.explanation,
              marks: q.marks || 4,
              topic: q.topic
            }))
          });
        }
      });
    }

    if (this.app.currentUser?.id) {
      this.testResults = await fetchUserTestResultsFromSupabase(this.app.currentUser.id);
    }
  }

  bindEvents() {
    const container = document.getElementById('view-syllabus-tests');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const uploadBtn = e.target.closest('#btn-open-upload-modal');
      if (uploadBtn) {
        this.openUploadModal();
      }

      const takeBtn = e.target.closest('.btn-take-test');
      if (takeBtn) {
        const testId = takeBtn.dataset.testId;
        this.startTest(testId);
      }

      const filterPill = e.target.closest('.test-filter-pill');
      if (filterPill) {
        container.querySelectorAll('.test-filter-pill').forEach(p => p.classList.remove('active'));
        filterPill.classList.add('active');
        this.activeFilterSubject = filterPill.dataset.subject || 'all';
        this.renderTestGrid();
      }
    });

    this.bindUploadModalEvents();
    this.bindTestRunnerModalEvents();
  }

  render() {
    const container = document.getElementById('view-syllabus-tests');
    if (!container) return;

    const studentGrade = this.app.profile?.grade || 'Class 12 • PCM';

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-title">Syllabus-Based Test Hub</h1>
          <p class="view-subtitle">Upload custom syllabus practice tests and take topic-aligned mock exams for <strong>${studentGrade}</strong></p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" id="btn-open-upload-modal">
            <i data-lucide="plus-circle"></i> Upload / Create Test
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="filter-row margin-bottom-6 flex-between flex-wrap gap-4">
        <div class="flex-align-center gap-2" id="subject-filter-group">
          <button class="test-filter-pill active" data-subject="all">All Subjects</button>
          <button class="test-filter-pill" data-subject="Physics">Physics</button>
          <button class="test-filter-pill" data-subject="Chemistry">Chemistry</button>
          <button class="test-filter-pill" data-subject="Mathematics">Mathematics</button>
          <button class="test-filter-pill" data-subject="Biology">Biology</button>
        </div>
        <div class="text-sm text-muted">
          Showing syllabus-aligned tests for <strong>${studentGrade}</strong>
        </div>
      </div>

      <!-- Tests Cards Grid -->
      <div id="tests-grid-container" class="grid-3 gap-6 margin-bottom-8">
        <!-- Rendered dynamically -->
      </div>

      <!-- Completed Test Results Section -->
      <div class="glass-card padding-6 margin-top-6">
        <h2 class="card-title margin-bottom-4 flex-align-center gap-2">
          <i data-lucide="award" class="text-amber"></i> Recent Test Attempt Performance
        </h2>
        <div id="test-results-list" class="table-container">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    this.renderTestGrid();
    this.renderTestResultsTable();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderTestGrid() {
    const grid = document.getElementById('tests-grid-container');
    if (!grid) return;

    let filtered = this.tests;
    if (this.activeFilterSubject !== 'all') {
      filtered = filtered.filter(t => t.subject.toLowerCase() === this.activeFilterSubject.toLowerCase());
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="grid-span-full text-center padding-8 glass-panel">
          <i data-lucide="book-open" style="width: 48px; height: 48px; opacity: 0.5;" class="margin-bottom-3"></i>
          <h3>No Tests Found for ${this.activeFilterSubject}</h3>
          <p class="text-muted text-sm margin-bottom-4">Upload a new test or switch to another subject tab.</p>
          <button class="btn btn-primary" id="btn-open-upload-modal-empty">Upload Test</button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = filtered.map(t => `
      <div class="test-card glass-panel padding-5 flex-column justify-between hover-lift">
        <div>
          <div class="flex-between margin-bottom-3">
            <span class="badge badge-primary">${t.subject}</span>
            <span class="badge badge-outline">${t.chapter}</span>
          </div>
          <h3 class="test-card-title margin-bottom-2">${t.title}</h3>
          <p class="test-card-desc text-sm text-muted margin-bottom-4">${t.description}</p>
        </div>

        <div>
          <div class="test-meta-info grid-2 gap-2 text-xs text-muted margin-bottom-4 padding-3 bg-dark-subtle rounded-md">
            <div><i data-lucide="file-text" style="width:14px; height:14px;"></i> ${t.questions ? t.questions.length : 0} Questions</div>
            <div><i data-lucide="award" style="width:14px; height:14px;"></i> ${t.totalMarks} Marks</div>
            <div><i data-lucide="clock" style="width:14px; height:14px;"></i> ${t.durationMins} Mins</div>
            <div><i data-lucide="graduation-cap" style="width:14px; height:14px;"></i> ${t.grade}</div>
          </div>

          <button class="btn btn-primary w-full btn-take-test" data-test-id="${t.id}">
            <i data-lucide="play"></i> Start Test Now
          </button>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  renderTestResultsTable() {
    const list = document.getElementById('test-results-list');
    if (!list) return;

    if (this.testResults.length === 0) {
      list.innerHTML = `
        <p class="text-muted text-sm padding-4 text-center">No test attempts completed yet. Choose a test above to begin your assessment!</p>
      `;
      return;
    }

    list.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Subject</th>
            <th>Score</th>
            <th>Percentage</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${this.testResults.map(r => {
            const pct = parseFloat(r.percentage || ((r.score / r.total_marks) * 100)).toFixed(1);
            let badgeClass = pct >= 80 ? 'badge-success' : pct >= 50 ? 'badge-amber' : 'badge-danger';
            return `
              <tr>
                <td><strong class="text-white">${r.test_title || r.testTitle}</strong></td>
                <td><span class="badge badge-outline">${r.subject}</span></td>
                <td><strong>${r.score} / ${r.total_marks || r.totalMarks}</strong></td>
                <td><span class="badge ${badgeClass}">${pct}%</span></td>
                <td>${pct >= 50 ? '<span class="text-success flex-align-center gap-1"><i data-lucide="check-circle" style="width:14px;"></i> Passed</span>' : '<span class="text-danger">Needs Practice</span>'}</td>
                <td class="text-xs text-muted">${new Date(r.completed_at || r.completedAt || Date.now()).toLocaleDateString()}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Upload Test Modal Handler
   */
  openUploadModal() {
    const modal = document.getElementById('modal-upload-test');
    if (!modal) return;
    modal.classList.add('active');
  }

  closeUploadModal() {
    const modal = document.getElementById('modal-upload-test');
    if (modal) modal.classList.remove('active');
  }

  bindUploadModalEvents() {
    const modal = document.getElementById('modal-upload-test');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeUploadModal());

    const form = modal.querySelector('#form-upload-test');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleTestFormSubmit(form);
      });
    }

    // JSON file upload handler
    const jsonInput = modal.querySelector('#file-upload-json');
    if (jsonInput) {
      jsonInput.addEventListener('change', (e) => this.handleJsonFileUpload(e));
    }
  }

  async handleJsonFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json.title || !json.subject || !json.questions) {
          alert('Invalid JSON schema! File must contain title, subject, chapter, and questions array.');
          return;
        }

        const newTest = {
          id: `test_${Date.now()}`,
          title: json.title,
          description: json.description || 'Uploaded Syllabus Test',
          grade: json.grade || this.app.profile?.grade || 'Class 12 • PCM',
          subject: json.subject,
          chapter: json.chapter || 'General',
          durationMins: parseInt(json.durationMins || 30),
          totalMarks: parseInt(json.totalMarks || (json.questions.length * 4)),
          createdAt: new Date().toISOString(),
          questions: json.questions
        };

        this.tests.unshift(newTest);
        this.saveTests();
        await saveSyllabusTestToSupabase(newTest, newTest.questions);

        alert(`Successfully imported "${newTest.title}" with ${newTest.questions.length} questions!`);
        this.closeUploadModal();
        this.render();
      } catch (err) {
        alert('Could not parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  async handleTestFormSubmit(form) {
    const title = form.querySelector('#input-test-title').value;
    const subject = form.querySelector('#input-test-subject').value;
    const chapter = form.querySelector('#input-test-chapter').value;
    const grade = form.querySelector('#input-test-grade').value;
    const durationMins = parseInt(form.querySelector('#input-test-duration').value || '20');

    // Read initial single question from form if entered
    const qText = form.querySelector('#input-q1-text').value;
    const optA = form.querySelector('#input-q1-a').value;
    const optB = form.querySelector('#input-q1-b').value;
    const optC = form.querySelector('#input-q1-c').value;
    const optD = form.querySelector('#input-q1-d').value;
    const correct = form.querySelector('#input-q1-correct').value;
    const exp = form.querySelector('#input-q1-exp').value;

    const questions = [];
    if (qText && optA && optB) {
      questions.push({
        id: `q_${Date.now()}_1`,
        questionText: qText,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctOption: correct,
        explanation: exp || 'Standard syllabus solution',
        marks: 5,
        topic: chapter
      });
    }

    const newTest = {
      id: `test_${Date.now()}`,
      title,
      description: `Syllabus test for ${subject} (${chapter})`,
      grade,
      subject,
      chapter,
      durationMins,
      totalMarks: questions.length * 5 || 20,
      createdAt: new Date().toISOString(),
      questions: questions.length > 0 ? questions : [
        {
          id: `q_sample_${Date.now()}`,
          questionText: `Sample Question for ${chapter}: Which of the following is correct regarding ${subject}?`,
          optionA: 'Option A Statement',
          optionB: 'Option B Statement',
          optionC: 'Option C Statement',
          optionD: 'Option D Statement',
          correctOption: 'A',
          explanation: 'Refer to textbook chapter for detailed derivation.',
          marks: 5,
          topic: chapter
        }
      ]
    };

    this.tests.unshift(newTest);
    this.saveTests();
    await saveSyllabusTestToSupabase(newTest, newTest.questions);

    alert(`Test "${title}" has been published and saved!`);
    this.closeUploadModal();
    form.reset();
    this.render();
  }

  /**
   * Interactive Test Runner & Auto Grading
   */
  startTest(testId) {
    const test = this.tests.find(t => t.id === testId);
    if (!test) return;

    this.currentTest = test;
    this.currentQuestionIdx = 0;
    this.userAnswers = {};

    this.testTimeLeftMins = test.durationMins;
    this.testTimeLeftSecs = 0;

    const modal = document.getElementById('modal-take-test');
    if (!modal) return;
    modal.classList.add('active');

    this.renderTestRunnerUI();
    this.startTestTimer();
  }

  startTestTimer() {
    if (this.testTimerInterval) clearInterval(this.testTimerInterval);

    this.testTimerInterval = setInterval(() => {
      if (this.testTimeLeftSecs > 0) {
        this.testTimeLeftSecs--;
      } else if (this.testTimeLeftMins > 0) {
        this.testTimeLeftMins--;
        this.testTimeLeftSecs = 59;
      } else {
        clearInterval(this.testTimerInterval);
        alert('Time is up! Submitting your test automatically.');
        this.submitCurrentTest();
        return;
      }

      this.updateTimerDisplay();
    }, 1000);
  }

  updateTimerDisplay() {
    const timerElem = document.getElementById('test-runner-timer');
    if (timerElem) {
      const mStr = String(this.testTimeLeftMins).padStart(2, '0');
      const sStr = String(this.testTimeLeftSecs).padStart(2, '0');
      timerElem.textContent = `${mStr}:${sStr}`;
    }
  }

  renderTestRunnerUI() {
    const modal = document.getElementById('modal-take-test');
    if (!modal || !this.currentTest) return;

    const questions = this.currentTest.questions || [];
    const q = questions[this.currentQuestionIdx];

    modal.innerHTML = `
      <div class="modal-content modal-large glass-panel padding-6">
        <!-- Test Header Bar -->
        <div class="flex-between margin-bottom-4 border-bottom padding-bottom-3">
          <div>
            <span class="badge badge-primary">${this.currentTest.subject}</span>
            <h2 class="modal-title display-inline margin-left-2">${this.currentTest.title}</h2>
          </div>
          <div class="flex-align-center gap-3">
            <div class="timer-banner glass-panel padding-2-4 flex-align-center gap-2">
              <i data-lucide="clock" class="text-amber"></i>
              <span id="test-runner-timer" class="font-mono text-bold text-lg">
                ${String(this.testTimeLeftMins).padStart(2, '0')}:${String(this.testTimeLeftSecs).padStart(2, '0')}
              </span>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-close-test-runner">Cancel</button>
          </div>
        </div>

        <div class="grid-12 gap-6">
          <!-- Main Question Container (8 Cols) -->
          <div class="col-span-8">
            <div class="question-box glass-card padding-5 margin-bottom-4">
              <div class="flex-between margin-bottom-3">
                <span class="badge badge-outline">Question ${this.currentQuestionIdx + 1} of ${questions.length}</span>
                <span class="text-xs text-muted">+${q ? q.marks : 4} Marks</span>
              </div>
              <h3 class="question-text text-lg margin-bottom-6">${q ? q.questionText : ''}</h3>

              <!-- Options List -->
              <div class="options-group flex-column gap-3">
                ${['A', 'B', 'C', 'D'].map(optKey => {
                  const optVal = q ? q[`option${optKey}`] : '';
                  if (!optVal) return '';
                  const isSelected = this.userAnswers[q.id] === optKey;
                  return `
                    <label class="option-card glass-panel padding-4 flex-align-center gap-3 cursor-pointer ${isSelected ? 'selected' : ''}" data-opt="${optKey}">
                      <input type="radio" name="q_opt" value="${optKey}" ${isSelected ? 'checked' : ''} class="hidden">
                      <span class="option-badge">${optKey}</span>
                      <span class="option-label-text text-sm">${optVal}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex-between">
              <button class="btn btn-secondary" id="btn-prev-q" ${this.currentQuestionIdx === 0 ? 'disabled' : ''}>
                <i data-lucide="chevron-left"></i> Previous
              </button>

              ${this.currentQuestionIdx < questions.length - 1 ? `
                <button class="btn btn-primary" id="btn-next-q">
                  Next Question <i data-lucide="chevron-right"></i>
                </button>
              ` : `
                <button class="btn btn-success" id="btn-submit-test">
                  <i data-lucide="check-circle"></i> Submit Test
                </button>
              `}
            </div>
          </div>

          <!-- Question Selection Palette Sidebar (4 Cols) -->
          <div class="col-span-4 glass-card padding-4">
            <h4 class="card-title text-sm margin-bottom-3">Question Palette</h4>
            <div class="q-palette-grid grid-4 gap-2 margin-bottom-6">
              ${questions.map((qItem, idx) => {
                const isAnswered = !!this.userAnswers[qItem.id];
                const isCurrent = idx === this.currentQuestionIdx;
                let btnClass = isCurrent ? 'q-btn-current' : isAnswered ? 'q-btn-answered' : 'q-btn-unanswered';
                return `
                  <button class="q-palette-btn ${btnClass}" data-q-idx="${idx}">
                    ${idx + 1}
                  </button>
                `;
              }).join('')}
            </div>

            <div class="text-xs text-muted flex-column gap-2 border-top padding-top-3">
              <div class="flex-align-center gap-2"><span class="dot dot-green"></span> Answered</div>
              <div class="flex-align-center gap-2"><span class="dot dot-blue"></span> Current Question</div>
              <div class="flex-align-center gap-2"><span class="dot dot-gray"></span> Not Visited</div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  bindTestRunnerModalEvents() {
    const modal = document.getElementById('modal-take-test');
    if (!modal) return;

    modal.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('#btn-close-test-runner');
      if (closeBtn) {
        if (confirm('Are you sure you want to exit? Progress will be lost.')) {
          clearInterval(this.testTimerInterval);
          modal.classList.remove('active');
        }
        return;
      }

      const optCard = e.target.closest('.option-card');
      if (optCard && this.currentTest) {
        const q = this.currentTest.questions[this.currentQuestionIdx];
        const optKey = optCard.dataset.opt;
        this.userAnswers[q.id] = optKey;
        this.renderTestRunnerUI();
        return;
      }

      const prevBtn = e.target.closest('#btn-prev-q');
      if (prevBtn && this.currentQuestionIdx > 0) {
        this.currentQuestionIdx--;
        this.renderTestRunnerUI();
        return;
      }

      const nextBtn = e.target.closest('#btn-next-q');
      if (nextBtn && this.currentTest && this.currentQuestionIdx < this.currentTest.questions.length - 1) {
        this.currentQuestionIdx++;
        this.renderTestRunnerUI();
        return;
      }

      const qPaletteBtn = e.target.closest('.q-palette-btn');
      if (qPaletteBtn) {
        this.currentQuestionIdx = parseInt(qPaletteBtn.dataset.qIdx);
        this.renderTestRunnerUI();
        return;
      }

      const submitBtn = e.target.closest('#btn-submit-test');
      if (submitBtn) {
        this.submitCurrentTest();
        return;
      }
    });
  }

  async submitCurrentTest() {
    if (this.testTimerInterval) clearInterval(this.testTimerInterval);

    const questions = this.currentTest.questions || [];
    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;

    questions.forEach(q => {
      const qMarks = q.marks || 5;
      totalMarks += qMarks;
      if (this.userAnswers[q.id] === q.correctOption) {
        score += qMarks;
        correctCount++;
      }
    });

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const resultObj = {
      testId: this.currentTest.id,
      testTitle: this.currentTest.title,
      subject: this.currentTest.subject,
      score,
      totalMarks,
      percentage,
      correctCount,
      totalQuestions: questions.length,
      timeTakenMins: this.currentTest.durationMins - this.testTimeLeftMins,
      completedAt: new Date().toISOString()
    };

    this.testResults.unshift(resultObj);
    if (this.app.currentUser?.id) {
      await saveTestResultToSupabase(this.app.currentUser.id, resultObj);
    }

    // Auto sync to Marks Tracker
    if (this.app.marksTracker) {
      this.app.exams.push({
        id: `exam_auto_${Date.now()}`,
        name: `${this.currentTest.title} (Syllabus Quiz)`,
        subject: this.currentTest.subject,
        score,
        totalMarks,
        date: new Date().toISOString().split('T')[0]
      });
      this.app.saveState();
    }

    const runnerModal = document.getElementById('modal-take-test');
    if (runnerModal) runnerModal.classList.remove('active');

    this.showResultModal(resultObj, questions);
    this.render();
  }

  showResultModal(result, questions) {
    const modal = document.getElementById('modal-test-result');
    if (!modal) return;
    modal.classList.add('active');

    const pct = result.percentage.toFixed(1);

    modal.innerHTML = `
      <div class="modal-content glass-panel padding-6">
        <div class="text-center margin-bottom-6">
          <div class="result-badge-circle margin-bottom-3 ${pct >= 70 ? 'badge-success-glow' : 'badge-amber-glow'}">
            <i data-lucide="${pct >= 70 ? 'award' : 'alert-circle'}" style="width: 48px; height: 48px;"></i>
          </div>
          <h2 class="modal-title text-2xl">${pct >= 70 ? 'Excellent Performance!' : 'Test Completed'}</h2>
          <p class="text-muted text-sm">${result.testTitle} • ${result.subject}</p>
        </div>

        <div class="grid-3 gap-4 margin-bottom-6">
          <div class="stat-card glass-card text-center padding-4">
            <span class="text-xs text-muted">Your Score</span>
            <h3 class="text-xl font-bold text-accent">${result.score} / ${result.totalMarks}</h3>
          </div>
          <div class="stat-card glass-card text-center padding-4">
            <span class="text-xs text-muted">Accuracy</span>
            <h3 class="text-xl font-bold text-emerald">${pct}%</h3>
          </div>
          <div class="stat-card glass-card text-center padding-4">
            <span class="text-xs text-muted">Correct Answers</span>
            <h3 class="text-xl font-bold text-blue">${result.correctCount} / ${result.totalQuestions}</h3>
          </div>
        </div>

        <!-- Detailed Solutions Preview -->
        <h4 class="card-title text-sm margin-bottom-3">Detailed Solution Explanations</h4>
        <div class="solutions-list flex-column gap-3 margin-bottom-6 max-h-60 overflow-y-auto padding-right-2">
          ${questions.map((q, idx) => {
            const userAns = this.userAnswers[q.id];
            const isCorrect = userAns === q.correctOption;
            return `
              <div class="solution-item glass-panel padding-3 rounded-md border-left-${isCorrect ? 'green' : 'red'}">
                <div class="flex-between text-xs margin-bottom-1">
                  <strong>Q${idx + 1}. ${q.topic || 'Syllabus Topic'}</strong>
                  <span class="${isCorrect ? 'text-success' : 'text-danger'} font-bold">
                    ${isCorrect ? 'Correct (+5)' : `Your Ans: ${userAns || 'None'} (Correct: ${q.correctOption})`}
                  </span>
                </div>
                <div class="text-xs text-muted">${q.explanation || 'See textbook reference.'}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="flex-center gap-3">
          <button class="btn btn-primary" id="btn-close-result-modal">
            Back to Syllabus Test Hub
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const closeBtn = modal.querySelector('#btn-close-result-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
  }
}
