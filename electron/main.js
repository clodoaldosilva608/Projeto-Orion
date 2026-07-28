const { app, BrowserWindow, autoUpdater, Menu } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Orion Platform",
    icon: path.join(__dirname, "../public/favicon.svg"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the Orion platform
  mainWindow.loadURL("https://orion-saas-platform.vercel.app");

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url);
    return { action: "deny" };
  });

  // Auto-updater
  autoUpdater.on("update-available", () => {
    mainWindow.webContents.send("update-available");
  });
  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update-downloaded");
  });
}

app.whenReady().then(() => {
  createWindow();
  // Check for updates
  if (process.env.ORION_UPDATE_URL) {
    autoUpdater.setFeedURL({ url: process.env.ORION_UPDATE_URL });
    autoUpdater.checkForUpdates();
    // Check every hour
    setInterval(() => autoUpdater.checkForUpdates(), 60 * 60 * 1000);
  }
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
