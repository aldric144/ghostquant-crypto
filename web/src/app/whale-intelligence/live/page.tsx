import { redirect } from "next/navigation";

export default function WhaleLivePage() {
  redirect("/whale-intelligence?view=live");
}
