import { HeroSection } from "@/components/blocks/hero-section-dark";
import Image from "next/image";

export default function Index() {
  return (
    <HeroSection
      title="Welcome to Budgetly"
      subtitle={{
        regular: "Keep Track of Your Budget ",
        gradient: "Create Smart Spending Habits",
      }}
      description=""
      ctaText="Get Started"
      ctaHref="/login"
      bottomImage={{
        light: "images/landing02_light.png",
        dark: "images/landing02_dark.png",
      }}
      gridOptions={{
        angle: 65,
        opacity: 0.4,
        cellSize: 50,
        lightLineColor: "#4a4a4a",
        darkLineColor: "#2a2a2a",
      }}
    />
  );
}
