"use client";
import React from "react";
import { SimpleHeader } from "../ui/simple-header";
import { useUser } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn } = useUser();

  return <>{!isSignedIn && <SimpleHeader />}</>;
}
