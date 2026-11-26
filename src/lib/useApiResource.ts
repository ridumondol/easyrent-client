"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";

export type UseApiResourceOptions = {
  pollIntervalMs?: number;
};

export function useApiResource<T>(
  path: string,
  token: string | null,
  options?: UseApiResourceOptions,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);

  // Default polling interval: 6 seconds to keep all information live and dynamic
  const pollInterval = options?.pollIntervalMs ?? 6000;
  const isInitialFetch = useRef(true);

  const reload = useCallback(() => {
    setError(null);
    setRefreshVersion((version) => version + 1);
  }, []);

  const mutate = useCallback((updater: T | ((prev: T | null) => T | null)) => {
    setData((prev) =>
      typeof updater === "function" ? (updater as (p: T | null) => T | null)(prev) : updater,
    );
  }, []);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    if (isInitialFetch.current) {
      setLoading(true);
    }

    apiRequest<T>(path, { token, signal: controller.signal })
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          isInitialFetch.current = false;
        }
      });

    return () => controller.abort();
  }, [path, refreshVersion, token]);

  // Dynamic background polling when visible
  useEffect(() => {
    if (!token || pollInterval <= 0) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        apiRequest<T>(path, { token })
          .then((res) => {
            setData(res);
            setError(null);
          })
          .catch(() => {
            // Background polling error is suppressed so it never interrupts the UI
          });
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [path, pollInterval, token]);

  // Refresh immediately when window or tab gets focus
  useEffect(() => {
    if (!token) return;

    let lastRefreshAt = 0;
    const refreshWhenVisible = () => {
      const now = Date.now();
      if (typeof document !== "undefined" && document.visibilityState === "visible" && now - lastRefreshAt > 1500) {
        lastRefreshAt = now;
        reload();
      }
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [reload, token]);

  return {
    data,
    setData,
    mutate,
    error: token ? error : "Sign in to view this information.",
    loading: token ? loading : false,
    reload,
  };
}
