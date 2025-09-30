"use client"

import BackgroundRippleEffectDemo from "../components/background-ripple-effect-demo"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

export default function SyntheticV0PageForDeployment() {
  return(
    <>
    {/* ✅ FIX: Wrap FloatingNav in fixed, full-width container with pointer-events-none */}
      <div
        className="fixed top-0 left-0 w-full z-[9999] pointer-events-none"
        style={{ height: "80px" }} // Optional: reserve space if needed
      >
        <div className="flex justify-center p-4">
          <div className="pointer-events-auto">
            <FloatingNav navItems={[{name:"Home",link:"/"},{name:"About Us",link:"#About"},{name:"Domains",link:"#domains"},{name:"Past Events",link:"#events"},{name:"Team",link:"#Team"}]} />
          </div>
        </div>
      </div>

      {/* Full background — now receives clicks */}
      <BackgroundRippleEffectDemo />
    </>
  ) 
}
