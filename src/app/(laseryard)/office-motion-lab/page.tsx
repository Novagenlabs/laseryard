import type { Metadata } from "next";
import { OfficeMotionLabClient } from "@/components/office-lab/OfficeMotionLabClient";

// Internal design lab for the Get Metal Business Cards hero: a real-time
// Three.js office scene with live dials. Never indexed, never linked.
export const metadata: Metadata = {
  title: "Office motion lab",
  robots: { index: false, follow: false, nocache: true },
};

export default function OfficeMotionLabPage() {
  return <OfficeMotionLabClient />;
}
