import { defineStore } from "pinia";

export const useTimerStore = defineStore({
  id: "timer",
  state: () => ({
    timerPause: false,
    areNotificationsOn: true,
    workTime: 1500, // Default work time in seconds (25 minutes)
    selectedSound: "metal-pipe", // Options: "metal-pipe", "system", "none"
  }),
  actions: {
    togglePause() {
      if (this.areNotificationsOn) this.timerPause = !this.timerPause;
    },
    pauseTimer() {
      if (this.areNotificationsOn) this.timerPause = true;
    },
    resumeTimer() {
      if (this.areNotificationsOn) this.timerPause = false;
    },
    setWorkTime(newTime) {
      if (typeof newTime === 'number' && !isNaN(newTime) && newTime > 0) {
        this.workTime = newTime;
      }
    },
    setSound(sound) {
      this.selectedSound = sound;
    },
  },
});