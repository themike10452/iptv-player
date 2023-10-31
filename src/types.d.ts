import { AxiosRequestConfig } from "axios";

interface Response {
	success: boolean;
  status?: number;
  statusText?: string;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

declare global {
  interface MainApi {
    request(req: AxiosRequestConfig): Promise<Response>;
  }

  interface Window {
    api: MainApi;
  }
}
