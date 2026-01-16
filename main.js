const {
  app,
  BrowserWindow,
  screen,
  ipcMain,
  Notification,
  Tray,
  Menu,
  nativeImage,
  powerMonitor,
} = require("electron/main");

const path = require("node:path");
const sound = require("sound-play");

let win;
let timer;
let timerValue;
let pauseTime;

// Activity tracking using Electron's built-in powerMonitor
let isCurrentlyIdle = false;
const IDLE_THRESHOLD = 30; // 30 seconds

const soundFilePath = path.join(__dirname, "metal-pipe.mp3");
const iconFilePath = path.join(__dirname, "icon.png");
app.setAppUserModelId("Clocky");

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 400,
    minWidth: 250,
    minHeight: 250,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    frame: false,
    resizable: true,
  });

  win.loadFile("dist/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on("mouse-move", (event, { x, y }) => {
  if (win) {
    const position = win.getPosition();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Mouse position tracking for existing functionality
let lastMousePosition = { x: null, y: null };
setInterval(() => {
  if (win) {
    const currentMousePosition = screen.getCursorScreenPoint();
    if (
      lastMousePosition.x !== currentMousePosition.x ||
      lastMousePosition.y !== currentMousePosition.y
    ) {
      win.webContents.send("mouse-move", currentMousePosition);
      lastMousePosition = currentMousePosition;
    }
  }
}, 100);

// Idle detection using Electron's powerMonitor (checks system-wide idle time)
setInterval(() => {
  if (win) {
    const idleSeconds = powerMonitor.getSystemIdleTime();
    const shouldBeIdle = idleSeconds >= IDLE_THRESHOLD;

    if (shouldBeIdle && !isCurrentlyIdle) {
      // Just became idle
      isCurrentlyIdle = true;
      win.webContents.send("idle-state-change", { isIdle: true, idleDuration: idleSeconds * 1000 });
    } else if (!shouldBeIdle && isCurrentlyIdle) {
      // User returned from idle
      isCurrentlyIdle = false;
      win.webContents.send("idle-state-change", { isIdle: false, idleDuration: 0 });
    }
  }
}, 1000);

let notificationsPermissionGranted = true;
ipcMain.on("request-notification-permission", (event) => {
  notificationsPermissionGranted = true;
  event.reply("notification-permission-granted");
});

ipcMain.on("send-notification", (event, title, body, soundType = "metal-pipe") => {
  if (notificationsPermissionGranted) {
    const useSystemSound = soundType === "system";
    const notification = new Notification({
      title,
      body,
      silent: !useSystemSound,
    });

    if (soundType === "metal-pipe") {
      sound.play(soundFilePath);
    }
    // "system" uses native notification sound, "none" is silent

    notification.show();
  }
});

ipcMain.on("preview-sound", (event, soundType) => {
  if (soundType === "metal-pipe") {
    sound.play(soundFilePath);
  } else if (soundType === "system") {
    // Play a short system beep by showing a quick notification
    const notification = new Notification({
      title: "Sound Preview",
      body: "System notification sound",
      silent: false,
    });
    notification.show();
  }
});

ipcMain.on("start-timer", (event, startValue) => {
  console.log('MAIN: Received start-timer with value:', startValue);
  timerValue = startValue;
  if (!timer) {
    timer = setInterval(() => {
      timerValue--;
      win.webContents.send("timer-tick", timerValue);
      if (timerValue <= 0) {
        clearInterval(timer);
        timer = null;
        win.webContents.send("timer-done");
      }
    }, 1000);
  }
});

ipcMain.on("stop-timer", () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

ipcMain.on("pause-timer", () => {
  if (timer) {
    pauseTime = timerValue;
    clearInterval(timer);
    timer = null;
  }
});

ipcMain.on("resume-timer", () => {
  if (!timer && pauseTime !== undefined) {
    timerValue = pauseTime;
    timer = setInterval(() => {
      timerValue--;
      win.webContents.send("timer-tick", timerValue);
      if (timerValue <= 0) {
        clearInterval(timer);
        timer = null;
        win.webContents.send("timer-done");
      }
    }, 1000);
  }
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('minimize-app', () => {
  win.minimize();
});

ipcMain.on('show-menu', () => {
  win.webContents.send('open-settings');
});