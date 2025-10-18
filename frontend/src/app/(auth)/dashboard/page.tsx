"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";

export default function Dashboard() {
  const api = useApi();
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api("/api/profile").then(setMe).catch(console.error);
  }, [api]);

  return <div></div>;
}
