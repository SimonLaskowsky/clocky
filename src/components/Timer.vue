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
const delayBeforeBreak = ref(false);
const splineApp = ref(null);

onMounted(() => {
  updateTimerDisplay(timerStore.workTime);

  ipcRenderer.on("mouse-move", (mousePosition) => {
    if (!delayBeforeBreak.value) {
      handleMouseMove();
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
  ipcRenderer.removeAllListeners("timer-tick");
  ipcRenderer.removeAllListeners("timer-done");
});

const handleMouseMove = () => {
  if (
    timerStore.areNotificationsOn &&
    !isCountingDown.value &&
    !timerStore.timerPause
  ) {
    changeStatusToWork();
  }
};

const handleTimerDone = () => {
  if (status.value === "Work") {
    timerStore.timerPause = true;
    delayBeforeBreak.value = true;
    emit("sendBreakNotification");
    setTimeout(() => {
      delayBeforeBreak.value = false;
      timerStore.timerPause = false;
      changeStatusToBreak();
    }, 10000);
  } else {
    changeStatusToWork();
  }
};

const changeStatusToWork = () => {
  status.value = "Work";
  splineApp.value?.setVariable("Status", status.value);
  ipcRenderer.send("start-timer", timerStore.workTime);
  isCountingDown.value = true;
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