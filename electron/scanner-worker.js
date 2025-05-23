const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");

function isAudioFile(filename) {
  return [".mp3", ".wav", ".ogg", ".flac"].includes(
    path.extname(filename).toLowerCase()
  );
}

function getAllFiles(dir, allFiles = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, allFiles);
    } else {
      allFiles.push(fullPath);
    }
  }
  return allFiles;
}

async function scan(folder) {
  const allFiles = getAllFiles(folder);
  const audioFiles = allFiles.filter(isAudioFile);
  const total = audioFiles.length;
  const tracks = [];

  for (let i = 0; i < total; i++) {
    const file = audioFiles[i];
    let metadata = {};
    try {
      const meta = await mm.parseFile(file);
      metadata = {
        title: meta.common.title || path.basename(file),
        artist: meta.common.artist || "",
        album: meta.common.album || "",
        length: meta.format.duration || 0,
      };
    } catch (err) {
      metadata = {
        title: path.basename(file),
        artist: "",
        album: "",
        length: 0,
      };
    }

    tracks.push({
      path: file,
      ...metadata,
    });

    if (i % 10 === 0 || i === total - 1) {
      parentPort.postMessage({
        type: "progress",
        current: i + 1,
        total,
      });
    }
  }

  parentPort.postMessage({ type: "done", tracks });
}

scan(workerData.folder);
