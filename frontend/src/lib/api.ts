"use client";
import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

export type FetchApi = <T>(path: string, init?: RequestInit) => Promise<T>;

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE is not configured");
  }

  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function buildApiUrl(path: string) {
  return new URL(path.replace(/^\//, ""), getApiBaseUrl()).toString();
}

function getErrorText(value: unknown) {
  if (!value || typeof value !== "object") return undefined;

  const errorValue = value as {
    message?: unknown;
    error?: unknown;
    detail?: unknown;
  };

  if (typeof errorValue.message === "string") return errorValue.message;
  if (typeof errorValue.error === "string") return errorValue.error;
  if (typeof errorValue.detail === "string") return errorValue.detail;

  return undefined;
}

export function useApi() {
  const { getToken } = useAuth();

  const fetchApi = useCallback(
    async function fetchApi<T>(
      path: string,
      init: RequestInit = {}
    ): Promise<T> {
      const token = await getToken();
      const isFormData = init.body instanceof FormData;
      const url = buildApiUrl(path);
      const res = await fetch(url, {
        ...init,
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...(init.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });
      const text = await res.text();
      const isJson = res.headers
        .get("Content-Type")
        ?.toLowerCase()
        .includes("application/json");

      if (!text) {
        if (!res.ok) throw new Error(`API ${res.status}`);
        return undefined as T;
      }

      if (isJson) {
        let data: T;

        try {
          data = JSON.parse(text) as T;
        } catch {
          throw new Error(
            `Failed to parse JSON response from ${path} (${res.status})`
          );
        }

        if (!res.ok) {
          throw new Error(getErrorText(data) || `API ${res.status}`);
        }

        return data;
      }

      if (!res.ok) throw new Error(text || `API ${res.status}`);

      return text as T;
    },
    [getToken]
  );

  return fetchApi;
}
