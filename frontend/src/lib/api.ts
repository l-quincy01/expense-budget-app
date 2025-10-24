import { useAuth } from "@clerk/nextjs";

export function useApi() {
  const { getToken } = useAuth();
  return async function fetchApi<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> {
    const token = await getToken();
    console.log("-------");
    console.log(process.env.NEXT_PUBLIC_API_BASE);
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
    return res.json();
  };
}
