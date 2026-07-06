
import { redirect } from "next/navigation";

export default function RootPage() {
  // Let the server handle the direction immediately before rendering anything
  redirect("/landing");
}
