/* ==========================================================================
   StudyOS — Multi-Theme Customization & Settings Engine
   ========================================================================== */

export class SettingsManager {
  constructor(app) {
    this.app = app;
    this.currentTheme = localStorage.getItem('study_os_theme') || 'cyberpunk';
    this.soundEnabled = localStorage.getItem('study_os_sound') !== 'false';
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.bindSettingsEvents();
  }

  applyTheme(themeName) {
    this.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('study_os_theme', themeName);

    // Update active state in settings modal theme options
    document.querySelectorAll('.theme-option-card').forEach(card => {
      if (card.getAttribute('data-theme-val') === themeName) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    console.log(`🎨 Theme changed to: ${themeName}`);
  }

  bindSettingsEvents() {
    // Theme options click
    document.querySelectorAll('.theme-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const theme = card.getAttribute('data-theme-val');
        if (theme) this.applyTheme(theme);
      });
    });

    // Sound toggle
    const soundToggle = document.getElementById('setting-sound-toggle');
    if (soundToggle) {
      soundToggle.checked = this.soundEnabled;
      soundToggle.addEventListener('change', (e) => {
        this.soundEnabled = e.target.checked;
        localStorage.setItem('study_os_sound', this.soundEnabled);
      });
    }

    // Settings trigger button
    const openBtn = document.getElementById('open-settings-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    const modal = document.getElementById('settings-modal');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.add('active'));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
  }
}
