import { redirect } from "next/navigation";

// Design Studio is disabled for now. Send visitors to the product page instead.
export default function DesignStudioPage() {
  redirect("/products/metal-business-cards");
}
