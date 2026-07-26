/* ==========================================================================
   StudyOS — Advanced AI Academic Assistant & System Personalizer Engine
   ========================================================================== */

function parseMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
    .replace(/\n/g, '<br>');
  return html;
}

export class AIAssistant {
  constructor(app) {
    this.app = app;
    this.history = [
      {
        role: 'assistant',
        text: '👋 **Welcome to StudyOS AI Assistant!**\n\nI can help you solve study doubts, explain formulas, create daily study plans, manage your tasks, and customize app colors & themes.\n\n*Try asking me:* \n- "Change theme to Ruby Red" or "Switch color to Cyan"\n- "Explain Newton\'s 3 Laws of Motion"\n- "Give me a 6-hour study plan for Physics"\n- "Add task: Practice Organic Chemistry"'
      }
    ];
  }

  init() {
    this.bindEvents();
    this.renderChat();
  }

  bindEvents() {
    const triggerBtn = document.getElementById('ai-assistant-trigger');
    const closeBtn = document.getElementById('close-ai-drawer-btn');
    const drawer = document.getElementById('ai-assistant-drawer');
    const sendBtn = document.getElementById('ai-send-btn');
    const input = document.getElementById('ai-user-input');

    if (triggerBtn && drawer) {
      triggerBtn.addEventListener('click', () => drawer.classList.add('active'));
    }
    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => drawer.classList.remove('active'));
    }

    if (sendBtn && input) {
      const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;
        this.processQuery(text);
        input.value = '';
      };

      sendBtn.addEventListener('click', handleSend);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    // Quick suggestion chips
    document.querySelectorAll('.ai-chip-prompt').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.innerText.replace(/^[^\w\s]+/, '').trim();
        this.processQuery(text);
      });
    });
  }

  processQuery(userText) {
    this.history.push({ role: 'user', text: userText });
    this.renderChat();

    // Render thinking indicator
    const chatContainer = document.getElementById('ai-chat-messages');
    if (chatContainer) {
      const tempId = 'ai-thinking-' + Date.now();
      const thinkingHtml = `
        <div id="${tempId}" class="ai-msg bot-msg margin-bottom-3 flex-column align-start">
          <div class="glass-card padding-3 rounded-md text-sm text-muted flex-align-center gap-2">
            <span class="pulse-indicator"></span> AI is thinking...
          </div>
        </div>
      `;
      chatContainer.insertAdjacentHTML('beforeend', thinkingHtml);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      setTimeout(() => {
        const el = document.getElementById(tempId);
        if (el) el.remove();

        const response = this.generateResponse(userText);
        this.history.push({ role: 'assistant', text: response });
        this.renderChat();
      }, 400);
    }
  }

  generateResponse(input) {
    const raw = input.trim();
    const lower = raw.toLowerCase();

    // ==========================================
    // 1. Theme & Color Customization Commands
    // ==========================================
    if (/theme|color|colour|look|mode|style|appearance/i.test(lower)) {
      if (lower.includes('red') || lower.includes('crimson') || lower.includes('ruby') || lower.includes('fire')) {
        this.app.settingsManager?.applyTheme('crimson');
        return '🔴 **Switched Theme to Ruby Crimson!** The workstation accent and glow are now styled in fiery ruby red.';
      }
      if (lower.includes('rose') || lower.includes('pink') || lower.includes('magenta')) {
        this.app.settingsManager?.applyTheme('rose');
        return '🌸 **Switched Theme to Rose Gold!** Applied vibrant neon rose and pink aesthetics across all dashboards.';
      }
      if (lower.includes('cyan') || lower.includes('aqua') || lower.includes('teal') || lower.includes('light blue')) {
        this.app.settingsManager?.applyTheme('cyan');
        return '🌊 **Switched Theme to Electric Cyan!** The workspace interface is now glowing in bright aqua cyan.';
      }
      if (lower.includes('emerald') || lower.includes('green') || lower.includes('forest') || lower.includes('mint')) {
        this.app.settingsManager?.applyTheme('emerald');
        return '🌲 **Switched Theme to Neon Emerald!** Forest green aesthetics have been activated.';
      }
      if (lower.includes('purple') || lower.includes('amethyst') || lower.includes('violet') || lower.includes('lavender')) {
        this.app.settingsManager?.applyTheme('amethyst');
        return '🔮 **Switched Theme to Sunset Amethyst!** Deep purple and lavender highlights applied.';
      }
      if (lower.includes('amber') || lower.includes('gold') || lower.includes('yellow') || lower.includes('orange')) {
        this.app.settingsManager?.applyTheme('amber');
        return '⚡ **Switched Theme to Solar Amber!** High-visibility gold-amber theme enabled.';
      }
      if (lower.includes('cyberpunk') || lower.includes('blue') || lower.includes('midnight') || lower.includes('dark')) {
        this.app.settingsManager?.applyTheme('cyberpunk');
        return '🌌 **Switched Theme to Midnight Cyberpunk!** Classic neon blue workstation mode restored.';
      }
      if (lower.includes('light') || lower.includes('white') || lower.includes('day')) {
        this.app.settingsManager?.applyTheme('light');
        return '☀️ **Switched to Clean Light Mode!** High contrast daylight UI activated.';
      }

      return '🎨 **Theme Personalizer**\nAvailable color themes:\n- **Ruby Crimson** (`red`)\n- **Rose Gold** (`pink`)\n- **Electric Cyan** (`cyan`)\n- **Neon Emerald** (`green`)\n- **Sunset Amethyst** (`purple`)\n- **Solar Amber** (`gold`)\n- **Midnight Cyberpunk** (`blue`)\n- **Clean Light Mode** (`light`)\n\n*Just tell me which color you prefer!*';
    }

    // Direct color triggers without word 'theme'
    if (/\b(ruby|crimson|rose|pink|cyan|aqua|emerald|amethyst|violet|amber|gold)\b/i.test(lower)) {
      if (lower.includes('ruby') || lower.includes('crimson')) {
        this.app.settingsManager?.applyTheme('crimson');
        return '🔴 Switched app accent color to **Ruby Crimson**!';
      }
      if (lower.includes('rose') || lower.includes('pink')) {
        this.app.settingsManager?.applyTheme('rose');
        return '🌸 Switched app accent color to **Rose Gold**!';
      }
      if (lower.includes('cyan') || lower.includes('aqua')) {
        this.app.settingsManager?.applyTheme('cyan');
        return '🌊 Switched app accent color to **Electric Cyan**!';
      }
    }

    // ==========================================
    // 2. App Navigation & Module Switching
    // ==========================================
    if (/open|go to|show|launch|switch to/i.test(lower)) {
      if (lower.includes('timer') || lower.includes('pomodoro') || lower.includes('focus')) {
        this.app.switchView('timer');
        return '⏱️ Navigated to **Focus Timer**. Ready to start a Pomodoro focus session!';
      }
      if (lower.includes('task') || lower.includes('todo') || lower.includes('homework')) {
        this.app.switchView('tasks');
        return '📋 Navigated to **Tasks & Homework**. Here are your pending assignments!';
      }
      if (lower.includes('test') || lower.includes('quiz') || lower.includes('exam')) {
        this.app.switchView('syllabus-tests');
        return '🎯 Navigated to **Syllabus Tests Hub**. You can take practice exams or upload tests here!';
      }
      if (lower.includes('monitor') || lower.includes('live') || lower.includes('active users')) {
        this.app.switchView('admin-monitor');
        return '👥 Navigated to **Live User Monitor**. Tracking online students and focus sessions!';
      }
      if (lower.includes('mark') || lower.includes('score') || lower.includes('subject')) {
        this.app.switchView('marks');
        return '📊 Navigated to **Subjects & Marks Tracker**.';
      }
      if (lower.includes('analytic') || lower.includes('chart') || lower.includes('stat')) {
        this.app.switchView('analytics');
        return '📈 Navigated to **Analytics Engine**.';
      }
      if (lower.includes('planner') || lower.includes('timetable')) {
        this.app.switchView('planner');
        return '🧠 Navigated to **AI Planner**.';
      }
    }

    // ==========================================
    // 3. Task & Goal Management Commands
    // ==========================================
    if (lower.includes('add task') || lower.includes('create task') || lower.includes('new task')) {
      const taskName = raw.replace(/add task|create task|new task/gi, '').replace(/[:\-]/g, '').trim() || 'Study Session';
      this.app.taskManager?.addTask({
        title: taskName.charAt(0).toUpperCase() + taskName.slice(1),
        subject: 'General Study',
        priority: 'High',
        dueDate: 'Today'
      });
      return `✅ **Task Created!** Added **"${taskName}"** to your task list.`;
    }

    if (lower.includes('set goal') || lower.includes('target goal') || lower.includes('goal to')) {
      const numMatch = lower.match(/\d+/);
      if (numMatch) {
        const hrs = parseInt(numMatch[0]);
        if (this.app.profile) {
          this.app.profile.dailyHours = hrs;
          this.app.saveState();
          this.app.updateStudentProfileUI();
        }
        return `🎯 **Daily Goal Updated!** Target study goal set to **${hrs} hours/day**.`;
      }
    }

    if (lower.includes('my tasks') || lower.includes('list tasks') || lower.includes('pending tasks')) {
      const pending = (this.app.tasks || []).filter(t => !t.completed);
      if (pending.length === 0) return '🎉 You have no pending tasks! Enjoy your break or create a new task.';
      const list = pending.slice(0, 5).map(t => `- **${t.title}** (${t.subject || 'General'}) • Priority: ${t.priority || 'Medium'}`).join('\n');
      return `📋 **Your Current Pending Tasks (${pending.length})**:\n${list}`;
    }

    // ==========================================
    // 4. Greetings & Casual Queries
    // ==========================================
    if (/^(hi|hello|hey|hii|heyy|sup|yo|greetings|good morning|good afternoon|good evening)/i.test(lower)) {
      const studentName = this.app.profile?.name ? this.app.profile.name.split(' ')[0] : 'Student';
      const studentGrade = this.app.profile?.grade || 'Class 12 • PCM';
      return `👋 **Hey ${studentName}!**\n\nI am your AI study copilot tuned for **${studentGrade}**.\n\nHow can I help you right now?\n- Solve physics, math, or chemistry doubts\n- Generate a daily timetable\n- Customize app colors & themes\n- Create tasks or start a study timer`;
    }

    // ==========================================
    // 5. Rich Academic Doubt Resolution Engine
    // ==========================================
    
    // Physics Explanations & Formulas
    if (lower.includes('physics') || lower.includes('electrostatic') || lower.includes('gauss') || lower.includes('coulomb') || lower.includes('motion') || lower.includes('newton') || lower.includes('gravit')) {
      if (lower.includes('electrostatic') || lower.includes('gauss') || lower.includes('coulomb')) {
        return `⚡ **Electrostatics High-Yield Summary**:\n\n1. **Coulomb\'s Law**: Force between two point charges:\n   \`F = (1 / 4πε₀) * (|q₁q₂| / r²)\` where \`1 / 4πε₀ ≈ 9 × 10⁹ N m²/C²\`\n\n2. **Electric Field (E)**:\n   \`E = F / q = (1 / 4πε₀) * (Q / r²)\`\n\n3. **Gauss\'s Law**: Total electric flux through a closed surface equals net charge enclosed divided by ε₀:\n   \`Φ = ∮ E · dA = Q_enclosed / ε₀\`\n\n4. **Key Concept**: Electric field inside a conducting hollow sphere is **ZERO**.`;
      }
      if (lower.includes('newton') || lower.includes('law of motion')) {
        return `🍎 **Newton\'s 3 Laws of Motion**:\n\n1. **1st Law (Inertia)**: An object remains at rest or in uniform motion unless acted upon by a net external force.\n2. **2nd Law (Momentum)**: Force equals rate of change of momentum: \`F = dp/dt = m * a\`.\n3. **3rd Law (Action-Reaction)**: For every action, there is an equal and opposite reaction (\`F_AB = -F_BA\`).`;
      }
      return `📚 **Physics Core Reference**:\n- **Kinematics**: \`v = u + at\`, \`s = ut + 0.5at²\`, \`v² = u² + 2as\`\n- **Ohm\'s Law**: \`V = I * R\`\n- **Work Energy Theorem**: \`W_net = ΔK = 0.5m(v² - u²)\`\n- **Power**: \`P = W / t = F * v\``;
    }

    // Calculus & Math Explanations
    if (lower.includes('math') || lower.includes('calculus') || lower.includes('integration') || lower.includes('derivative') || lower.includes('matrix') || lower.includes('trigonometry')) {
      if (lower.includes('integration') || lower.includes('integral')) {
        return `🧮 **Calculus Integration Rules**:\n\n1. **Power Rule**: \`∫ xⁿ dx = xⁿ⁺¹ / (n + 1) + C\` (for n ≠ -1)\n2. **Logarithmic**: \`∫ (1 / x) dx = ln|x| + C\`\n3. **Exponential**: \`∫ eˣ dx = eˣ + C\`\n4. **Integration by Parts**: \`∫ u dv = u*v - ∫ v du\`\n5. **Trig Integrals**: \`∫ cos(x) dx = sin(x) + C\`, \`∫ sin(x) dx = -cos(x) + C\``;
      }
      if (lower.includes('derivative') || lower.includes('differentiation')) {
        return `📐 **Differentiation Essentials**:\n\n- **Product Rule**: \`d/dx [u*v] = u*(dv/dx) + v*(du/dx)\`\n- **Quotient Rule**: \`d/dx [u/v] = (v*du/dx - u*dv/dx) / v²\`\n- **Chain Rule**: \`d/dx [f(g(x))] = f'(g(x)) * g'(x)\`\n- \`d/dx [sin(x)] = cos(x)\`, \`d/dx [cos(x)] = -sin(x)\`, \`d/dx [eˣ] = eˣ\``;
      }
      return `🔢 **Mathematics Quick Formulas**:\n- **Quadratic Formula**: \`x = (-b ± √(b² - 4ac)) / (2a)\`\n- **Pythagorean Theorem**: \`a² + b² = c²\`\n- **Sin²θ + Cos²θ = 1**`;
    }

    // Chemistry Explanations
    if (lower.includes('chemistry') || lower.includes('organic') || lower.includes('reaction') || lower.includes('acid') || lower.includes('mole')) {
      if (lower.includes('organic') || lower.includes('sn1') || lower.includes('sn2')) {
        return `🧪 **Organic Chemistry: SN1 vs SN2 Mechanisms**:\n\n- **SN1 (Substitution Nucleophilic Unimolecular)**:\n  - 2-step process via stable **Carbocation intermediate**.\n  - Favored by **3° (Tertiary) alkyl halides** and polar protic solvents (Water, Alcohol).\n  - Results in **Racemization**.\n\n- **SN2 (Substitution Nucleophilic Bimolecular)**:\n  - 1-step concerted transition state.\n  - Favored by **1° (Primary) alkyl halides** and strong nucleophiles.\n  - Results in complete **Walden Inversion** of configuration.`;
      }
      return `🧪 **Chemistry Fundamentals**:\n- **Ideal Gas Equation**: \`P * V = n * R * T\`\n- **pH Formula**: \`pH = -log10[H+]\`\n- **Molarity (M)**: \`Moles of solute / Liters of solution\`\n- **Avogadro\'s Number**: \`N_A = 6.022 × 10²³ mol⁻¹\``;
    }

    // Biology Explanations
    if (lower.includes('biology') || lower.includes('cell') || lower.includes('photosynthesis') || lower.includes('dna') || lower.includes('genetics')) {
      return `🧬 **Biology Core Concepts**:\n\n- **Photosynthesis Equation**: \`6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂\` (Occurs in Chloroplasts)\n- **Cell Respiration**: \`C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 36 ATP\` (Occurs in Mitochondria)\n- **DNA Replication**: Semi-conservative replication synthesized 5' to 3' by DNA Polymerase.`;
    }

    // Study Strategy & Timetable
    if (lower.includes('schedule') || lower.includes('timetable') || lower.includes('routine') || lower.includes('how to study') || lower.includes('score')) {
      return `🎯 **Optimized High-Yield Study Routine**:\n\n1. **Morning Focus (8:00 AM - 10:30 AM)**: Tackle your hardest subject (e.g., Physics numericals or Organic mechanisms).\n2. **Pomodoro Technique**: Use **25m study / 5m break** cycles to maintain peak focus.\n3. **Active Recall**: Don\'t just re-read; solve practice questions in **Syllabus Tests** tab.\n4. **Evening Spaced Revision**: Spend 30 mins reviewing flashcards in **Active Recall Decks**.`;
    }

    // Default Smart Contextual Response
    const userName = this.app.profile?.name ? this.app.profile.name.split(' ')[0] : 'there';
    return `💡 **AI Assistant Answer for ${userName}**:\n\nRegarding **"${raw}"**:\n\n- To organize this topic in StudyOS, you can add a dedicated task using the button below or start a focus timer session.\n- You can also take topic tests in the **Syllabus Tests** tab or customize your workspace color by typing *"change color to red"* or *"cyan"*!\n\n*Feel free to ask me for any formula, study guide, or app action!*`;
  }

  renderChat() {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    container.innerHTML = this.history.map(msg => `
      <div class="ai-msg ${msg.role === 'user' ? 'user-msg' : 'bot-msg'}" style="margin-bottom: 12px; display: flex; flex-direction: column; align-items: ${msg.role === 'user' ? 'flex-end' : 'flex-start'};">
        <div style="max-width: 88%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; ${
          msg.role === 'user' 
            ? 'background: var(--primary-container); color: white; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);' 
            : 'background: var(--surface-container-high); color: var(--on-surface); border-bottom-left-radius: 4px; border: 1px solid var(--glass-border); shadow: 0 4px 12px rgba(0,0,0,0.1);'
        }">
          ${parseMarkdown(msg.text)}
        </div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  }
}
