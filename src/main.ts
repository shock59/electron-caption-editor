import {
  app,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  dialog,
  FileFilter,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { writeFile } from "node:fs/promises";
import { Caption } from "./types";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const fileFilters: FileFilter[] = [
  { name: "SubRip Text (.srt)", extensions: ["srt"] },
  { name: "WebVTT (.vtt)", extensions: ["vtt"] },
];

function padZeroes(
  original: number,
  digits: number = 2,
  position: "start" | "end" = "start"
) {
  let newString = `${original}`;
  while (newString.length < digits) {
    if (position == "start") newString = "0" + newString;
    else newString += "0";
  }
  return newString;
}

function formatSrtTimestamp(seconds: number) {
  return `${padZeroes(Math.floor(seconds / 60 ** 2))}:${padZeroes(
    Math.floor(seconds / 60)
  )}:${padZeroes(Math.floor(seconds % 60))},${padZeroes(
    Math.round((seconds % Math.floor(seconds)) * 1000),
    3,
    "end"
  )}`;
}

function captionsToSrt(captions: Caption[]) {
  let srtContents = "";

  for (let i = 0; i < captions.length; i++) {
    const caption = captions[i];
    srtContents += `${i + 1}
${formatSrtTimestamp(caption.times[0])} --> ${formatSrtTimestamp(
      caption.times[1]
    )}
${caption.lines.join("\n")}

`;
  }

  return srtContents;
}

function handleOpenFile(event: IpcMainEvent) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  dialog.showOpenDialog(win, {
    filters: fileFilters,
  });
}

async function handleSaveFile(event: IpcMainEvent, captions: Caption[]) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  const saveDialog = await dialog.showSaveDialog(win, {
    defaultPath: "captions.srt",
    filters: fileFilters,
  });
  if (saveDialog.canceled) {
    return;
  }
  const fileDestination = saveDialog.filePath;
  await writeFile(fileDestination, captionsToSrt(captions));
  await dialog.showMessageBox(win, {
    message: `File saved to ${fileDestination}`,
  });
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1462,
    height: 688,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  ipcMain.on("open-file", handleOpenFile);
  ipcMain.on("save-file", handleSaveFile);
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
