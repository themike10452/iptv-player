import { app, BrowserWindow, ipcMain, protocol } from "electron";
import axios, { AxiosError } from "axios";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  // mainWindow.setMenu(null);
  mainWindow.maximize();
};

protocol.registerSchemesAsPrivileged([
  { scheme: "iptv", privileges: { stream: true, bypassCSP: true } },
  { scheme: "iptvs", privileges: { stream: true, bypassCSP: true } },
]);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  const handleProtocolRequest = async (request: Request) => {
    try {
      const url = request.url
        ?.replace("iptv:", "http:")
        ?.replace("iptvs:", "https:");

      const res = await axios.get(url, {
        method: "GET",
        headers: {
          "User-Agent": "VLC",
        },
        responseType: "stream",
        maxRedirects: 0,
        validateStatus: (status) => {
          return status >= 200 && status < 400;
        },
      });

      const headers = { ...res.headers };
      if (headers["location"]) {
        headers["location"] = headers["location"]
          .replace("http:", "iptv:")
          .replace("https:", "iptvs:");
      }

      return new Response(res.data, {
        status: res.status,
        statusText: res.statusText,
        headers: new Headers(headers as any),
      });
    } catch (e) {
      console.error(e);
    }
  };

  protocol.handle("iptv", handleProtocolRequest);
  protocol.handle("iptvs", handleProtocolRequest);

  ipcMain.handle("request", async (event, req) => {
    try {
      const res = await axios.request(req);
      return {
        success: true,
        status: res.status,
        statusText: res.statusText,
        data: res.data,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: false,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }
    }
  });
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
