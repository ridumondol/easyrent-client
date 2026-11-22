"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest, ApiError, getErrorMessage, type Equipment } from "@/lib/api";

type EquipmentResponse = { equipment: Equipment };

export function useEquipmentLabels(ids: string[], token: string | null) {
  const idsKey = useMemo(() => [...new Set(ids)].sort().join(","), [ids]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idsKey || !token) return;

    let active = true;
    const equipmentIds = idsKey.split(",");
    Promise.all(
      equipmentIds.map(async (id) => {
        try {
          const result = await apiRequest<EquipmentResponse>(`/equipment/${id}`, { token });
          return [id, result.equipment.title] as const;
        } catch (requestError) {
          if (requestError instanceof ApiError && requestError.status === 404) {
            return [id, `Equipment ${id.slice(-6)}`] as const;
          }
          throw requestError;
        }
      }),
    )
      .then((entries) => {
        if (active) {
          setLabels(Object.fromEntries(entries));
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(getErrorMessage(requestError));
      });

    return () => {
      active = false;
    };
  }, [idsKey, token]);

  return { labels: token ? labels : {}, error: token ? error : null };
}
