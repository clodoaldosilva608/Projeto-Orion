const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("orionDesktop", {
  isDesktop: true,
  onUpdateAvailable: (cb) => ipcRenderer.on("update-available", cb),
  onUpdateDownloaded: (cb) => ipcRenderer.on("update-downloaded", cb),
  installUpdate: () => ipcRenderer.send("install-update"),
});
