/* ==========================================================================
   StudyOS — Interactive AI Study Assistant & Personalizer
   ========================================================================== */

function parseMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
    .replace(/\n/g, '<br>');
  return html;
}

export class AIAssistant {
  constructor(app) {
    this.app = app;
    this.history = [
      {
        role: 'assistant',
        text: '👋 **Hi there!** I am your StudyOS AI Assistant.\n\nI can help you find study resources, explain formulas, add tasks, or change app themes. What would you like help with today?'
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
        const text = chip.innerText;
        this.processQuery(text);
      });
    });
  }

  processQuery(userText) {
    this.history.push({ role: 'user', text: userText });
    this.renderChat();

    setTimeout(() => {
      const response = this.generateResponse(userText);
      this.history.push({ role: 'assistant', text: response });
      this.renderChat();
    }, 400);
  }

  generateResponse(input) {
    const lower = input.toLowerCase().trim();

    // 1. Casual Greetings & Hellos
    if (/^(hi|hello|hey|hii|heyy|hii bruh|hey bruh|sup|yo|greetings|good morning|good evening)/i.test(lower)) {
      const name = this.app.profile?.name ? this.app.profile.name.split(' ')[0] : 'friend';
      return `👋 Hey ${name}! Ready to crush your study goals today? Tell me what you're studying or ask me to change themes/add tasks!`;
    }

    // 2. Theme Change Commands
    if (lower.includes('emerald') || lower.includes('green theme')) {
      if (this.app.settingsManager) this.app.settingsManager.applyTheme('emerald');
      return '🌲 Done! Switched theme to **Neon Emerald**.';
    }
    if (lower.includes('cyberpunk') || lower.includes('blue theme')) {
      if (this.app.settingsManager) this.app.settingsManager.applyTheme('cyberpunk');
      return '🌌 Done! Switched theme to **Midnight Cyberpunk**.';
    }
    if (lower.includes('amethyst') || lower.includes('purple theme')) {
      if (this.app.settingsManager) this.app.settingsManager.applyTheme('amethyst');
      return '🔮 Done! Switched theme to **Sunset Amethyst**.';
    }
    if (lower.includes('amber') || lower.includes('gold theme')) {
      if (this.app.settingsManager) this.app.settingsManager.applyTheme('amber');
      return '⚡ Done! Switched theme to **Solar Amber**.';
    }
    if (lower.includes('light mode') || lower.includes('light theme')) {
      if (this.app.settingsManager) this.app.settingsManager.applyTheme('light');
      return '☀️ Switched to **Clean Light** mode!';
    }

    // 3. Add Task Commands
    if (lower.includes('add task') || lower.includes('create task')) {
      const taskName = input.replace(/add task|create task/gi, '').trim() || 'New Study Session';
      this.app.taskManager.addTask({
        title: taskName.charAt(0).toUpperCase() + taskName.slice(1),
        subject: 'General Study',
        priority: 'High',
        dueDate: 'Today'
      });
      return `✅ Added task **"${taskName}"** to your Task List!`;
    }

    // 4. Goal Hours Command
    if (lower.includes('set goal') || lower.includes('goal to')) {
      const match = lower.match(/\d+/);
      if (match) {
        const hours = parseInt(match[0]);
        this.app.profile.dailyHours = hours;
        this.app.saveState();
        this.app.updateStudentProfileUI();
        return `🎯 Updated your daily study goal to **${hours} hours**!`;
      }
    }

    // 5. Subject & Academic Queries
    if (lower.includes('formula') || lower.includes('physics')) {
      return '📚 **Physics Cheat Sheet**:\n- **Newton\'s 2nd Law**: `F = ma`\n- **Kinetic Energy**: `E_k = 0.5 * m * v^2`\n- **Ohm\'s Law**: `V = I * R`\n- **Work Done**: `W = F * d * cos(θ)`\n\nTip: You can practice 3D flashcards in **Active Recall Decks**!';
    }

    if (lower.includes('math') || lower.includes('calculus') || lower.includes('integration')) {
      return '🧮 **Calculus Integration Essentials**:\n- Power Rule: `∫ x^n dx = x^(n+1)/(n+1) + C`\n- Exponential: `∫ e^x dx = e^x + C`\n- By Parts Formula: `∫ u dv = u*v - ∫ v du`';
    }

    if (lower.includes('chemistry') || lower.includes('organic')) {
      return '🧪 **Chemistry Revision Guide**:\n- **pH Formula**: `pH = -log[H+]`\n- **Ideal Gas Equation**: `PV = nRT`\n- **Sn2 vs Sn1**: Sn2 is 1-step concerted with inversion; Sn1 is 2-step via carbocation intermediate.';
    }

    if (lower.includes('schedule') || lower.includes('timetable') || lower.includes('plan')) {
      return '📅 **AI Schedule Recommendation**:\n1. Focus 2 hours on your weakest subject early in the morning.\n2. Use the **Pomodoro Focus Timer** (25 min study / 5 min break).\n3. Complete daily revision cards before 9:00 PM.';
    }

    return `💡 **Study Insight**: I\'ve analyzed your current workflow. Try launching a 25-minute Pomodoro session in **Focus Timer** or reviewing weak topics in **AI Planner**!`;
  }

  renderChat() {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    container.innerHTML = this.history.map(msg => `
      <div class="ai-msg ${msg.role === 'user' ? 'user-msg' : 'bot-msg'}" style="margin-bottom: 12px; display: flex; flex-direction: column; align-items: ${msg.role === 'user' ? 'flex-end' : 'flex-start'};">
        <div style="max-width: 85%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; ${
          msg.role === 'user' 
            ? 'background: var(--primary-container); color: white; border-bottom-right-radius: 4px;' 
            : 'background: var(--surface-container-high); color: var(--on-surface); border-bottom-left-radius: 4px; border: 1px solid var(--glass-border);'
        }">
          ${parseMarkdown(msg.text)}
        </div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  }
}
