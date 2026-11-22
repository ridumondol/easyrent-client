"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";

export function useApiResource<T>(path: string, token: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    apiRequest<T>(path, { token, signal: controller.signal })
      .then(setData)
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [path, refreshVersion, token]);

  return {
    data,
    error: token ? error : "Sign in to view this information.",
    loading: token ? loading : false,
    reload,
  };
}
