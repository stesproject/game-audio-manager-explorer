const { app, BrowserWindow, dialog, ipcMain, protocol } = require("electron");
const path = require("path");
const fs = require("fs");
const mm = require("music-metadata");

function isAudioFile(filename) {
  return [".mp3", ".wav", ".ogg", ".flac"].includes(
    path.extname(filename).toLowerCase()
  );
}

function walkDir(
  dir,
  win,
  filelist = [],
  total = { count: 0 },
  progress = { current: 0 }
) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath, win, filelist, total, progress);
    } else {
      total.count++;
    }
  }

  const files2 = fs.readdirSync(dir);
  for (const file of files2) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath, win, filelist, total, progress);
    } else if (isAudioFile(filepath)) {
      filelist.push({ path: filepath });
    }
    progress.current++;
    win.webContents.send("scan-progress", {
      current: progress.current,
      total: total.count,
    });
  }

  return filelist;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // win.loadFile("dist/index.html"); // In production
  win.loadURL("http://localhost:5173"); // In development

  ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"],
    });
    if (result.canceled || result.filePaths.length === 0) return [];
    const folder = result.filePaths[0];
    const audioFiles = walkDir(folder, win);

    const metadataList = await Promise.all(
      audioFiles.map(async (file) => {
        const filePath = file.path;
        try {
          const metadata = await mm.parseFile(filePath);
          return {
            path: filePath,
            title: metadata.common.title || "",
            artist: metadata.common.artist || "Unknown",
            album: metadata.common.album || "Unknown",
            length: metadata.format.duration || 0,
          };
        } catch {
          return {
            path: filePath,
            title: "",
            artist: "Unknown",
            album: "Unknown",
            length: 0,
          };
        }
      })
    );

    return metadataList;
  });
}

app.whenReady().then(() => {
  protocol.registerFileProtocol("localfile", (request, callback) => {
    const url = request.url.replace("localfile://", "");
    callback(decodeURIComponent(url));
  });

  createWindow();
});
