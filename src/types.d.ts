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

  interface LiveStreamCategory {
    category_id: string;
    category_name: string;
  }

  export interface LiveStream {
    num: number;
    name: string;
    stream_type: string;
    stream_id: number;
    stream_icon: string;
    epg_channel_id: string;
    added: string;
    is_adult: number;
    category_id: string;
    category_ids: number[];
    custom_sid: null;
    tv_archive: number;
    direct_source: string;
    tv_archive_duration: string;
  }
}
