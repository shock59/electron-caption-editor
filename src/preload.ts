// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { Caption } from "./types";

declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<Caption[]>;
      saveFile: (captions: Caption[]) => void;
    };
  }
}

const api: Window["electronAPI"] = {
  openFile: () => ipcRenderer.invoke("open-file"),
  saveFile: (captions: Caption[]) => ipcRenderer.send("save-file", captions),
};
contextBridge.exposeInMainWorld("electronAPI", api);
