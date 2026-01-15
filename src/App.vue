<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Timer from "./components/Timer.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import { useTimerStore } from "@/stores/timerStore";
const { ipcRenderer } = window.api;

const timer = ref(null);
const timerStore = useTimerStore();
const showSettings = ref(false);

const handleMouseDown = (event) => {
  if (event.button === 2) {
    ipcRenderer.send("right-mouse-down");
  }
};

const handleMouseUp = (event) => {
  if (event.button === 2) {
    ipcRenderer.send("right-mouse-up");
  }
};

const handleMouseMove = (event) => {
  ipcRenderer.send("mouse-move", {
    x: event.movementX,
    y: event.movementY,
  });
};

const handleCloseClick = () => {
  ipcRenderer.send('close-app');
};

const handleMenuClick = (event) => {
  ipcRenderer.send('show-menu', { x: event.x, y: event.y });
};

onMounted(() => {
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("mousemove", handleMouseMove);

  document.getElementById('close-btn').addEventListener('click', handleCloseClick);
  document.getElementById('menu-btn').addEventListener('click', handleMenuClick);

  ipcRenderer.on('open-settings', () => {
    showSettings.value = true;
  });
});

onUnmounted(() => {
  window.removeEventListener("mousedown", handleMouseDown);
  window.removeEventListener("mouseup", handleMouseUp);
  window.removeEventListener("mousemove", handleMouseMove);

  const closeBtn = document.getElementById('close-btn');
  const menuBtn = document.getElementById('menu-btn');
  if (closeBtn) closeBtn.removeEventListener('click', handleCloseClick);
  if (menuBtn) menuBtn.removeEventListener('click', handleMenuClick);

  ipcRenderer.removeAllListeners('open-settings');
});

const closeSettings = () => {
  showSettings.value = false;
};

const sendBreakNotification = () => {
  if (!timerStore.areNotificationsOn) return;
  window.electron.sendNotification(
    "Time's up!",
    "Take a short break. The timer will restart automatically when you return."
  );
};
</script>

<template>
  <div id="titlebar">
    <button id="menu-btn" title="Settings">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    <button id="close-btn" title="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
  <main>
    <div class="timer-wrapper">
      <Timer
        ref="timer"
        @sendBreakNotification="sendBreakNotification"
      />
    </div>
  </main>
  <SettingsPanel v-if="showSettings" @close="closeSettings" />
</template>