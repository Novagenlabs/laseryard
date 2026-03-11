import type { Metadata } from "next";
import { DesignStudio } from "@/components/design-studio/DesignStudio";

export const metadata: Metadata = {
  title: "Design Studio | Laser Yard — Preview Your Metal Business Card",
  description:
    "Upload your logo and instantly preview how it will look laser-engraved on a premium matte-black metal business card. Free to use, no account needed.",
  openGraph: {
    title: "Design Studio — See Your Metal Card Before You Order",
    description:
      "Upload your design and watch it come to life on a laser-engraved metal business card. Interactive 3D preview, instant results.",
  },
};

export default function DesignStudioPage() {
  return <DesignStudio />;
}
