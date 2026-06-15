"use client";

import { useApi } from "@/lib/api";
import { profileApi } from "@/features/auth/services/profile-api";
import { getErrorMessage } from "@/lib/utils";
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
        const res = await profileApi.get(fetchApi);
        setData(res);
      } catch (e: unknown) {
        setError(getErrorMessage(e, "Failed to load profile"));
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchApi]);

  return { data, loading, error };
}
