/* ==========================================================================
   StudyOS — Focus Study Timer & Web Audio Sound Generator Module
   ========================================================================== */

export class StudyTimer {
  constructor(appState, updateCallback) {
    this.state = appState;
    this.updateCallback = updateCallback;
    this.durationSec = 25 * 60;
    this.remainingSec = 25 * 60;
    this.isRunning = false;
    this.intervalId = null;
    this.selectedSubject = "Physics";

    // Web Audio Synthesizer
    this.audioCtx = null;
    this.activeSource = null;
    this.gainNode = null;
    this.activeSound = 'off';
    this.volume = 0.5;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setSound(soundType) {
    this.activeSound = soundType;
    this.stopSound();
    if (soundType === 'off') return;

    this.initAudio();
    if (!this.audioCtx) return;

    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    if (soundType === 'pink' || soundType === 'rain') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      if (soundType === 'rain') {
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        whiteNoise.connect(filter);
        filter.connect(this.gainNode);
      } else {
        whiteNoise.connect(this.gainNode);
      }

      whiteNoise.start();
      this.activeSource = whiteNoise;
    } else if (soundType === 'binaural') {
      // 40Hz Binaural Gamma Tone Generator
      const oscLeft = this.audioCtx.createOscillator();
      const oscRight = this.audioCtx.createOscillator();
      const merger = this.audioCtx.createChannelMerger(2);

      oscLeft.frequency.value = 200;
      oscRight.frequency.value = 240;

      oscLeft.connect(merger, 0, 0);
      oscRight.connect(merger, 0, 1);
      merger.connect(this.gainNode);

      oscLeft.start();
      oscRight.start();
      this.activeSource = {
        stop: () => {
          oscLeft.stop();
          oscRight.stop();
        }
      };
    }
  }

  stopSound() {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch (e) {}
      this.activeSource = null;
    }
  }

  setVolume(volVal) {
    this.volume = parseFloat(volVal);
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  setPreset(mins) {
    this.stop();
    this.durationSec = mins * 60;
    this.remainingSec = mins * 60;
    this.updateDisplay();
  }

  setSubject(subjectName) {
    this.selectedSubject = subjectName;
    const subLabel = document.getElementById('dash-timer-subject');
    if (subLabel) subLabel.innerText = `${subjectName} Focus`;
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    if (this.activeSound !== 'off') {
      this.setSound(this.activeSound);
    }

    this.intervalId = setInterval(() => {
      if (this.remainingSec > 0) {
        this.remainingSec--;
        this.updateDisplay();
      } else {
        this.onTimerComplete();
      }
    }, 1000);

    this.updateButtons();
  }

  pause() {
    this.isRunning = false;
    if (this.intervalId) clearInterval(this.intervalId);
    this.stopSound();
    this.updateButtons();
  }

  stop() {
    this.pause();
  }

  reset() {
    this.pause();
    this.remainingSec = this.durationSec;
    this.updateDisplay();
  }

  updateButtons() {
    const dashStartBtn = document.getElementById('dash-timer-start-btn');
    if (dashStartBtn) {
      dashStartBtn.innerText = this.isRunning ? 'Pause Focus' : 'Start Focus';
      dashStartBtn.style.background = this.isRunning ? 'var(--error-container)' : 'var(--primary-container)';
      dashStartBtn.style.color = this.isRunning ? 'var(--on-error-container)' : 'var(--on-primary-container)';
    }

    const fullStartBtn = document.getElementById('timer-full-start-btn');
    if (fullStartBtn) {
      fullStartBtn.innerText = this.isRunning ? 'Pause Session' : 'Start Session';
    }
  }

  onTimerComplete() {
    this.pause();
    const completedMins = Math.round(this.durationSec / 60);
    
    this.state.timerLogs.unshift({
      id: 'tl_' + Date.now(),
      subject: this.selectedSubject,
      durationMins: completedMins,
      date: new Date().toISOString().split('T')[0]
    });
    
    this.state.saveState();
    alert(`Great job! You completed a ${completedMins}-minute focus session on ${this.selectedSubject}!`);
    if (this.updateCallback) this.updateCallback();
  }

  updateDisplay() {
    const mins = Math.floor(this.remainingSec / 60);
    const secs = this.remainingSec % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const dashDigits = document.getElementById('dash-timer-digits');
    if (dashDigits) dashDigits.innerText = timeStr;

    const dashRing = document.getElementById('dash-timer-progress-ring');
    if (dashRing) {
      const circumference = 477.52;
      const progressFraction = this.remainingSec / this.durationSec;
      dashRing.style.strokeDashoffset = (circumference * (1 - progressFraction)).toString();
    }

    const fullDigits = document.getElementById('timer-full-digits');
    if (fullDigits) fullDigits.innerText = timeStr;
  }

  renderFullView() {
    const container = document.getElementById('timer-full-container');
    if (!container) return;

    container.innerHTML = `
      <div style="max-width: 520px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 24px;">
        
        <div style="display: flex; gap: 10px;">
          <button onclick="window.studyApp.studyTimer.setPreset(25)" class="btn-timer-secondary" style="padding: 8px 18px; font-weight: 700;">25 Min Focus</button>
          <button onclick="window.studyApp.studyTimer.setPreset(45)" class="btn-timer-secondary" style="padding: 8px 18px; font-weight: 700;">45 Min Intensive</button>
          <button onclick="window.studyApp.studyTimer.setPreset(15)" class="btn-timer-secondary" style="padding: 8px 18px; font-weight: 700;">15 Min Break</button>
        </div>

        <div class="timer-circle-box" style="width: 240px; height: 240px;">
          <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="86" fill="transparent" stroke="rgba(255,255,255,0.08)" stroke-width="10"></circle>
            <circle cx="100" cy="100" r="86" fill="transparent" stroke="var(--primary-container)" stroke-width="10" stroke-linecap="round" stroke-dasharray="540.35" stroke-dashoffset="135"></circle>
          </svg>
          <div class="timer-display-overlay">
            <span id="timer-full-digits" style="font-size: 48px; font-weight: 800; font-family: var(--font-geist);">${Math.floor(this.remainingSec/60)}:00</span>
            <span style="font-size: 13px; color: var(--on-surface-variant); margin-top: 4px;">Subject: ${this.selectedSubject}</span>
          </div>
        </div>

        <div style="display: flex; gap: 16px; width: 100%;">
          <button id="timer-full-start-btn" onclick="window.studyApp.studyTimer.toggle()" class="btn-timer-primary" style="padding: 14px; font-size: 16px;">
            ${this.isRunning ? 'Pause Session' : 'Start Session'}
          </button>
          <button onclick="window.studyApp.studyTimer.reset()" class="btn-timer-secondary" style="padding: 14px 24px;">Reset</button>
        </div>

        <!-- Ambient Sound Synthesizer Controls -->
        <div class="glass-card" style="width: 100%; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px;">
              <span class="material-symbols-outlined" style="color: var(--primary);">graphic_eq</span>
              <span>Ambient Sound Generator</span>
            </div>
            <select onchange="window.studyApp.studyTimer.setSound(this.value)" class="search-input" style="width: auto; padding: 6px 12px;">
              <option value="off" ${this.activeSound==='off'?'selected':''}>Mute Sound</option>
              <option value="pink" ${this.activeSound==='pink'?'selected':''}>Pink Noise (Focus)</option>
              <option value="rain" ${this.activeSound==='rain'?'selected':''}>Rainfall Simulation</option>
              <option value="binaural" ${this.activeSound==='binaural'?'selected':''}>40Hz Binaural Beats</option>
            </select>
          </div>
          
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="material-symbols-outlined" style="font-size: 18px; color: var(--on-surface-variant);">volume_down</span>
            <input type="range" min="0" max="1" step="0.05" value="${this.volume}" oninput="window.studyApp.studyTimer.setVolume(this.value)" style="flex: 1; accent-color: var(--primary-container);" />
            <span class="material-symbols-outlined" style="font-size: 18px; color: var(--on-surface-variant);">volume_up</span>
          </div>
        </div>

        <div style="width: 100%; text-align: left;">
          <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 10px;">Select Study Subject</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${this.state.subjects.map(s => `
              <button onclick="window.studyApp.studyTimer.setSubject('${s.name}')" class="btn-timer-secondary" style="padding: 6px 14px; font-size: 12px; ${this.selectedSubject===s.name?'border-color: var(--primary); color: var(--primary);':''}">
                ${s.name}
              </button>
            `).join('')}
          </div>
        </div>

      </div>
    `;
    this.updateDisplay();
  }
}
