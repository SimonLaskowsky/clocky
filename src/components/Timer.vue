<script setup>
import { ref, watch, watchEffect, onMounted, onUnmounted } from "vue";
import { useTimerStore } from "@/stores/timerStore";
const { ipcRenderer } = window.api;
import { Vue3Spline } from "vue3-spline";

const inputTime = ref("25:00");
const emit = defineEmits(["sendBreakNotification"]);
const status = ref("Work");
const timerStore = useTimerStore();
const isCountingDown = ref(false);
const splineApp = ref(null);

// Break timer (counts up)
let breakTimer = null;
let breakSeconds = 0;

// Await timer (counts down from 30)
let awaitTimer = null;
let awaitSeconds = 30;

onMounted(() => {
  updateTimerDisplay(timerStore.workTime);

  ipcRenderer.on("mouse-move", (mousePosition) => {
    handleActivity();
  });

  ipcRenderer.on("idle-state-change", ({ isIdle, idleDuration }) => {
    timerStore.setIdleState(isIdle);

    if (isIdle && timerStore.awaitingBreak) {
      // User went idle after work ended = confirmed on break
      stopAwaitTimer();
      timerStore.setAwaitingBreak(false);
      timerStore.setBreakState(true);
      changeStatusToBreak();
      startBreakTimer();
    }
  });

  ipcRenderer.on("timer-tick", (timerValue) => {
    updateTimerDisplay(timerValue);
  });

  ipcRenderer.on("timer-done", () => {
    handleTimerDone();
  });

  watchEffect(() => {
    if (!splineApp.value) return;
    watch(() => splineApp.value?.getVariable("IsPause"), (newValue) => {
      if (newValue) {
        ipcRenderer.send("pause-timer");
      } else {
        ipcRenderer.send("resume-timer");
      }
    });
  });
});

onUnmounted(() => {
  ipcRenderer.removeAllListeners("mouse-move");
  ipcRenderer.removeAllListeners("idle-state-change");
  ipcRenderer.removeAllListeners("timer-tick");
  ipcRenderer.removeAllListeners("timer-done");
  stopAwaitTimer();
  stopBreakTimer();
});

const handleActivity = () => {
  if (timerStore.isOnBreak) {
    // User returned from break - stop break timer and restart work
    stopBreakTimer();
    timerStore.setBreakState(false);
    changeStatusToWork();
  } else if (
    timerStore.areNotificationsOn &&
    !isCountingDown.value &&
    !timerStore.timerPause &&
    !timerStore.awaitingBreak
  ) {
    // Original behavior - restart work if in break status
    changeStatusToWork();
  }
};

const startBreakTimer = () => {
  breakSeconds = 0;
  updateBreakDisplay();
  breakTimer = setInterval(() => {
    breakSeconds++;
    updateBreakDisplay();
  }, 1000);
};

const stopBreakTimer = () => {
  if (breakTimer) {
    clearInterval(breakTimer);
    breakTimer = null;
  }
  breakSeconds = 0;
};

const updateBreakDisplay = () => {
  if (splineApp.value) {
    const minutes = Math.floor(breakSeconds / 60).toString().padStart(2, "0");
    const seconds = (breakSeconds % 60).toString().padStart(2, "0");
    inputTime.value = `${minutes}:${seconds}`;
    splineApp.value?.setVariable("TimerValue", inputTime.value);
  }
};

const handleTimerDone = () => {
  console.log("Timer done! Status:", status.value);
  if (status.value === "Work") {
    // Work timer ended - notify and wait for user to go idle
    console.log("Emitting sendBreakNotification");
    emit("sendBreakNotification");
    timerStore.setAwaitingBreak(true);
    changeStatusToAwaitingBreak();
    // No more hardcoded delay - we wait for actual idle detection
  }
  // Note: Break doesn't have a timer anymore
  // User returns when they're ready, detected via activity
};

const changeStatusToWork = () => {
  status.value = "Work";
  splineApp.value?.setVariable("Status", status.value);
  ipcRenderer.send("start-timer", timerStore.workTime);
  isCountingDown.value = true;
};

const changeStatusToAwaitingBreak = () => {
  isCountingDown.value = false;
  status.value = "Await";
  splineApp.value?.setVariable("Status", status.value);
  startAwaitTimer();
};

const startAwaitTimer = () => {
  awaitSeconds = 30;
  updateAwaitDisplay();
  awaitTimer = setInterval(() => {
    awaitSeconds--;
    updateAwaitDisplay();
    if (awaitSeconds <= 0) {
      stopAwaitTimer();
    }
  }, 1000);
};

const stopAwaitTimer = () => {
  if (awaitTimer) {
    clearInterval(awaitTimer);
    awaitTimer = null;
  }
};

const updateAwaitDisplay = () => {
  if (splineApp.value) {
    const minutes = Math.floor(awaitSeconds / 60).toString().padStart(2, "0");
    const seconds = (awaitSeconds % 60).toString().padStart(2, "0");
    splineApp.value?.setVariable("TimerValue", `${minutes}:${seconds}`);
  }
};

const changeStatusToBreak = () => {
  isCountingDown.value = false;
  status.value = "Break";
  splineApp.value?.setVariable("Status", status.value);
};

const updateTimerDisplay = (timerValue) => {
  if (splineApp.value) {
    const minutes = Math.floor(timerValue / 60).toString().padStart(2, "0");
    const seconds = (timerValue % 60).toString().padStart(2, "0");
    inputTime.value = `${minutes}:${seconds}`;
    splineApp.value?.setVariable("TimerValue", inputTime.value);
  }
};
</script>

<template>
  <Vue3Spline
    ref="splineApp"
    :scene="{
      url: 'https://draft.spline.design/fQDikUkeawXAXvwT/scene.splinecode',
    }"
  />
</template>