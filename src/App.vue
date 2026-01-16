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
  console.log("sendBreakNotification called, notifications on:", timerStore.areNotificationsOn);
  if (!timerStore.areNotificationsOn) return;
  window.electron.sendNotification(
    "Time's up!",
    "Take a short break. The timer will restart automatically when you return.",
    timerStore.selectedSound
  );
};
</script>

<template>
  <div id="titlebar">
    <button id="menu-btn" title="Settings">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="2"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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