"use client";
import React from "react";
import { SimpleHeader } from "./simple-header";
import { useUser } from "@clerk/nextjs";
import { SiteHeader } from "./site-header";

export default function Header() {
  const { isSignedIn } = useUser();

  return (
    <div className="mb-4 sticky">
      {isSignedIn ? <SiteHeader /> : <SimpleHeader />}
    </div>
  );
}
