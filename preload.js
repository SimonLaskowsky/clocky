// preload.js
const { contextBridge, ipcRenderer } = require("electron");
// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

contextBridge.exposeInMainWorld("api", {
  ipcRenderer: {
    send: ipcRenderer.send,
    on: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    removeAllListeners: ipcRenderer.removeAllListeners,
  },
});
//Notification permission
contextBridge.exposeInMainWorld("electron", {
  requestNotificationPermission: () =>
    ipcRenderer.send("request-notification-permission"),
  sendNotification: (title, body, soundType = "metal-pipe") =>
    ipcRenderer.send("send-notification", title, body, soundType),
  onNotificationPermissionGranted: (func) =>
    ipcRenderer.on("notification-permission-granted", (event) => func()),
});
