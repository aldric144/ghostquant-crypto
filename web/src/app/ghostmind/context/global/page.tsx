import { redirect } from "next/navigation";

export default function GlobalContextPage() {
  redirect("/ghostmind?context=global");
}
