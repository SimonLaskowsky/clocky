import { defineStore } from "pinia";

export const useTimerStore = defineStore({
  id: "timer",
  state: () => ({
    timerPause: false,
    areNotificationsOn: true,
    workTime: 1500, // Default work time in seconds (25 minutes)
    selectedSound: "metal-pipe", // Options: "metal-pipe", "system", "none"
    // Intelligent activity tracking
    isIdle: false,           // Currently idle (no activity for 1 min)
    isOnBreak: false,        // Confirmed on break (idle after work ended)
    awaitingBreak: false,    // Work ended, waiting for user to go idle
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
    // Activity tracking actions
    setIdleState(idle) {
      this.isIdle = idle;
    },
    setBreakState(onBreak) {
      this.isOnBreak = onBreak;
    },
    setAwaitingBreak(awaiting) {
      this.awaitingBreak = awaiting;
    },
  },
});