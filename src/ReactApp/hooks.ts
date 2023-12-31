import React from "react";
import { useSettings } from "./Settings";

export const useLiveCategories = () => {
  const { settings, isValid: validSettings } = useSettings();
  const [data, setData] = React.useState<LiveStreamCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    if (!validSettings) {
      setLoading(false);
      return;
    }

    setLoading(true);

    window.api
      .request({
        method: "GET",
        url: `${settings.url}/player_api.php`,
        params: {
          username: settings.username,
          password: settings.password,
          action: `get_live_categories`,
        },
        headers: {
          "User-Agent": settings.userAgent,
        },
      })
      .then((res) => {
        if (res.success) {
          const categories = res.data as LiveStreamCategory[];
          categories.unshift({
            category_id: "",
            category_name: "All Channels",
          });
          console.log(categories);
          setData(categories);
          setError(null);
        } else {
          console.error(res);
					setData([]);
          setError(res.error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [settings, validSettings]);

  return { data, loading, error };
};

export const useLiveChannels = (categoryId?: string | null) => {
  const { settings, isValid: validSettings } = useSettings();
  const [data, setData] = React.useState<LiveStream[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    if (categoryId == null || !validSettings) {
      return;
    }

    setLoading(true);

    window.api
      .request({
        method: "GET",
        url: `${settings.url}/player_api.php`,
        params: {
          username: settings.username,
          password: settings.password,
          action: `get_live_streams`,
          category_id: categoryId,
        },
        headers: {
          "User-Agent": settings.userAgent,
        },
      })
      .then((res) => {
        if (res.success) {
          console.log(res.data);
          setData(res.data);
          setError(null);
        } else {
          console.error(res);
					setData([]);
          setError(res.error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryId, settings, validSettings]);

  return { data, loading, error };
};
