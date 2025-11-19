"use client";
import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

export function useApi() {
  const { getToken } = useAuth();

  const fetchApi = useCallback(
    async function fetchApi<T>(
      path: string,
      init: RequestInit = {}
    ): Promise<T> {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const text = await res.text();
      if (!text) {
        return undefined as T;
      }
      return JSON.parse(text) as T;
    },
    [getToken]
  );

  return fetchApi;
}
