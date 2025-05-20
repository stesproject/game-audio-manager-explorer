const { app, BrowserWindow, ipcMain, dialog, protocol } = require("electron");
const path = require("path");
const fs = require("fs");
const mm = require("music-metadata");

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:5173");
}

ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled) return [];

  const folderPath = result.filePaths[0];
  const files = fs.readdirSync(folderPath);
  const audioFiles = files.filter(
    (file) => file.endsWith(".mp3") || file.endsWith(".flac")
  );

  const metadataList = await Promise.all(
    audioFiles.map(async (file) => {
      const filePath = path.join(folderPath, file);
      try {
        const metadata = await mm.parseFile(filePath);
        return {
          path: filePath,
          title: metadata.common.title || file,
          artist: metadata.common.artist || "Unknown",
          album: metadata.common.album || "Unknown",
        };
      } catch {
        return {
          path: filePath,
          title: file,
          artist: "Unknown",
          album: "Unknown",
        };
      }
    })
  );

  return metadataList;
});

app.whenReady().then(() => {
  protocol.registerFileProtocol('localfile', (request, callback) => {
    const url = request.url.replace('localfile://', '');
    callback(decodeURIComponent(url));
  });

  createWindow();
});


