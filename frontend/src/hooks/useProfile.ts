/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApi } from "@/lib/api";
import { Profile } from "@/types/types";
import { useEffect, useState, useRef } from "react";

export function useProfile() {
  const fetchApi = useApi();
  const [data, setData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    (async () => {
      try {
        const res = await fetchApi<Profile>("/api/profile");
        setData(res);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchApi]);

  return { data, loading, error };
}
