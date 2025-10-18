"use client";
import React from "react";
import { Footer2 } from "../ui/shadcnblocks-com-footer2";
import { useUser } from "@clerk/nextjs";

export default function Footer() {
  const demoData = {
    logo: {
      src: "https://www.shadcnblocks.com/images/block/block-1.svg",
      alt: "blocks for shadcn/ui",
      title: "Shadcnblocks.com",
      url: "https://www.shadcnblocks.com",
    },
    tagline: "Components made easy.",
    menuItems: [
      {
        title: "Product",
        links: [
          { text: "Overview", url: "#" },
          { text: "Pricing", url: "#" },
          { text: "Marketplace", url: "#" },
          { text: "Features", url: "#" },
          { text: "Integrations", url: "#" },
          { text: "Pricing", url: "#" },
        ],
      },
      {
        title: "Company",
        links: [
          { text: "About", url: "#" },
          { text: "Team", url: "#" },
          { text: "Blog", url: "#" },
          { text: "Careers", url: "#" },
          { text: "Contact", url: "#" },
          { text: "Privacy", url: "#" },
        ],
      },
      {
        title: "Resources",
        links: [
          { text: "Help", url: "#" },
          { text: "Sales", url: "#" },
          { text: "Advertise", url: "#" },
        ],
      },
      {
        title: "Social",
        links: [
          { text: "Twitter", url: "#" },
          { text: "Instagram", url: "#" },
          { text: "LinkedIn", url: "#" },
        ],
      },
    ],
    copyright: "© 2024 Copyright. All rights reserved.",
    bottomLinks: [
      { text: "Terms and Conditions", url: "#" },
      { text: "Privacy Policy", url: "#" },
    ],
  };

  const { isSignedIn } = useUser();
  return <div className="px-8">{!isSignedIn && <Footer2 {...demoData} />}</div>;
}
