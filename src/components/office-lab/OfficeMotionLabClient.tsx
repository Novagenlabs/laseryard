"use client";

import dynamic from "next/dynamic";

const OfficeMotionLab = dynamic(() => import("./OfficeMotionLab"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0a0a0a] text-[#a3a49b] text-xs uppercase tracking-[0.14em]">
      Loading the office…
    </div>
  ),
});

export function OfficeMotionLabClient() {
  return <OfficeMotionLab />;
}
