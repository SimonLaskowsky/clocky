<script setup>
import { ref } from 'vue';
import { useTimerStore } from "@/stores/timerStore";
const { ipcRenderer } = window.api;

const emit = defineEmits(['close']);
const timerStore = useTimerStore();
const minutesInput = ref(Math.floor(timerStore.workTime / 60));
const saved = ref(false);

const saveTime = () => {
  const minutes = parseInt(minutesInput.value, 10);
  if (!isNaN(minutes) && minutes > 0) {
    timerStore.setWorkTime(minutes * 60); // Convert minutes to seconds
    ipcRenderer.send('start-timer', timerStore.workTime);
    saved.value = true;
    setTimeout(() => {
      saved.value = false;
    }, 2000);
  }
};

const previewSound = (sound) => {
  ipcRenderer.send('preview-sound', sound);
};
</script>

<template>
  <div class="settings-overlay" @click.self="emit('close')">
    <div class="settings-panel">
      <header>
        <div class="header-content">
          <h1>Clocky</h1>
          <span class="version">Focus Timer</span>
        </div>
        <button class="close-btn" @click="emit('close')" title="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </header>

      <section class="card">
        <h3>How it works</h3>
        <div class="feature-list">
          <div class="feature">
            <span class="feature-icon">⏱️</span>
            <p>Counts down your focus time (default 25 min)</p>
          </div>
          <div class="feature">
            <span class="feature-icon">🔔</span>
            <p>Notifies you when it's time for a break</p>
          </div>
          <div class="feature">
            <span class="feature-icon">🔄</span>
            <p>Auto-restarts when you return from break</p>
          </div>
          <div class="feature">
            <span class="feature-icon">👆</span>
            <p>Click the 3D clock buttons to pause/resume the timer</p>
          </div>
        </div>
      </section>

      <section class="card">
        <h3>Focus Duration</h3>
        <div class="time-input-group">
          <div class="input-wrapper">
            <input
              v-model="minutesInput"
              type="number"
              min="1"
              step="5"
            />
            <span class="input-suffix">minutes</span>
          </div>
          <button class="save-btn" :class="{ saved }" @click="saveTime">
            {{ saved ? '✓ Saved' : 'Save' }}
          </button>
        </div>
        <p class="hint">Common: 25 min (Pomodoro), 50 min (deep work)</p>
      </section>

      <section class="card">
        <h3>Notification Sound</h3>
        <div class="sound-options">
          <label class="sound-option" :class="{ active: timerStore.selectedSound === 'metal-pipe' }">
            <input type="radio" v-model="timerStore.selectedSound" value="metal-pipe" @change="previewSound('metal-pipe')" />
            <span class="sound-icon">🔔</span>
            <span class="sound-label">Metal Pipe</span>
          </label>
          <label class="sound-option" :class="{ active: timerStore.selectedSound === 'system' }">
            <input type="radio" v-model="timerStore.selectedSound" value="system" @change="previewSound('system')" />
            <span class="sound-icon">🔊</span>
            <span class="sound-label">System</span>
          </label>
          <label class="sound-option" :class="{ active: timerStore.selectedSound === 'none' }">
            <input type="radio" v-model="timerStore.selectedSound" value="none" />
            <span class="sound-icon">🔇</span>
            <span class="sound-label">Silent</span>
          </label>
        </div>
      </section>

      <footer>
        <p>Made with ☕ by Szymon</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.settings-panel {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  font-family: "Inter", "Raleway", -apple-system, sans-serif;
}

.settings-panel::-webkit-scrollbar {
  display: none;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.version {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.close-btn {
  background: #f5f5f5;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  color: #666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: scale(1.05);
}

.close-btn:active {
  transform: scale(0.95);
}

.card {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card:last-of-type {
  border-bottom: none;
}

h3 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feature-icon {
  font-size: 18px;
  line-height: 1.4;
}

.feature p {
  margin: 0;
  font-size: 14px;
  color: #444;
  line-height: 1.5;
}

.time-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #88d388;
  background: #fff;
}

input[type="number"] {
  width: 100%;
  padding: 12px 16px;
  padding-right: 70px;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  color: #1a1a1a;
  background: transparent;
  border: none;
  outline: none;
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-suffix {
  position: absolute;
  right: 16px;
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.save-btn {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border-radius: 12px;
  background: linear-gradient(135deg, #88d388 0%, #6bc46b 100%);
  border: none;
  color: white;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 80px;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(136, 211, 136, 0.4);
}

.save-btn:active {
  transform: translateY(0);
}

.save-btn.saved {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #999;
}

.sound-options {
  display: flex;
  gap: 10px;
}

.sound-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: #f8f8f8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.sound-option:hover {
  background: #f0f0f0;
}

.sound-option.active {
  background: #e8f5e8;
  border-color: #88d388;
}

.sound-option input {
  display: none;
}

.sound-icon {
  font-size: 20px;
}

.sound-label {
  font-size: 12px;
  font-weight: 500;
  color: #555;
}

.sound-option.active .sound-label {
  color: #2d7a2d;
}

footer {
  padding: 16px 24px;
  text-align: center;
}

footer p {
  margin: 0;
  font-size: 12px;
  color: #bbb;
}
</style>
