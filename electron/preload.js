const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectFolder: () => ipcRenderer.invoke("select-folder")
});