import {
  app,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  dialog,
  FileFilter,
  protocol,
  net,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import fs from "node:fs";
import { writeFile, readFile } from "node:fs/promises";
import { Caption } from "./types";
import subsrt from "subsrt-ts";
import { ContentCaption } from "subsrt-ts/dist/types/handler";
import mime from "mime";

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

async function handleOpenVideo(event: IpcMainEvent) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  const openDialog = await dialog.showOpenDialog(win, {
    filters: [
      { name: "Video files (.mp4, .webm)", extensions: ["mp4", "webm"] },
    ],
  });
  return `media://${openDialog.filePaths[0]}`;
}

async function handleOpenFile(event: IpcMainEvent) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  const openDialog = await dialog.showOpenDialog(win, {
    filters: fileFilters,
  });

  const fileContents = await readFile(openDialog.filePaths[0], "utf-8");
  const rawCaptions = subsrt.parse(fileContents, { verbose: true });

  let captions: Caption[] = [];
  for (let caption of rawCaptions) {
    const cc = caption as ContentCaption;
    captions.push({
      times: [cc.start / 1000, cc.end / 1000],
      lines: cc.content.split("\n"),
    });
  }
  return captions;
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

protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true,
    },
  },
]);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  ipcMain.handle("open-video", handleOpenVideo);
  ipcMain.handle("open-file", handleOpenFile);
  ipcMain.on("save-file", handleSaveFile);

  protocol.handle("media", (req) => {
    const pathToMedia = decodeURI(req.url.replace("media:/", ""));
    const mimeType = mime.getType(pathToMedia) || "application/octet-stream";

    const stat = fs.statSync(pathToMedia);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    const headers: Record<string, string> = {
      "Content-Type": mimeType,
      "Accept-Ranges": "bytes",
    };

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new Response(null, { status: 416, headers });
      }

      const chunksize = end - start + 1;

      const stream = fs.createReadStream(pathToMedia, { start, end });

      headers["Content-Range"] = `bytes ${start}-${end}/${fileSize}`;
      headers["Content-Length"] = chunksize.toString();

      return new Response(stream as any, {
        status: 206,
        headers,
      });
    } else {
      const stream = fs.createReadStream(pathToMedia);
      headers["Content-Length"] = fileSize.toString();

      return new Response(stream as any, {
        status: 200,
        headers,
      });
    }

    // return net.fetch(`file://${pathToMedia}`);
  });

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
