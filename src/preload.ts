// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { AxiosRequestConfig } from "axios";

contextBridge.exposeInMainWorld("api", {
  request: (req: AxiosRequestConfig) => {
    return ipcRenderer.invoke("request", req);
  },
});
