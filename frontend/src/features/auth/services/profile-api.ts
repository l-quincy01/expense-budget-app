import type { FetchApi } from "@/lib/api";
import type { Profile } from "@/types/types";

export const profileApi = {
  get: (api: FetchApi) => api<Profile>("/api/profile"),
};
