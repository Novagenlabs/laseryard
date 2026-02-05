import { redirect } from "next/navigation";

export default function ProductsPage() {
  // Redirect to the main product page since we only have one product currently
  redirect("/products/metal-business-cards");
}
