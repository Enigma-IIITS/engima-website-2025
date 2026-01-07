"use client";

import BackgroundRippleEffectDemo from "../components/background-ripple-effect-demo";
import { FloatingNav } from "@/components/ui/floating-navbar";

export default function HomePage() {
  // Removed "Admin" from here, as the nav now handles it smartly
  const navItems = [
    { name: "Home", link: "/" },
    { name: "About", link: "#About" },
    { name: "Domains", link: "#domains" },
    { name: "RSVP", link: "#rsvp" },
    { name: "Events", link: "#events" },
    { name: "Team", link: "#Team" },
  ];
  return (
    <>
      <FloatingNav navItems={navItems} />
      <BackgroundRippleEffectDemo />
    </>
  );
}
