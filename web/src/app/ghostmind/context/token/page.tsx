import { redirect } from "next/navigation";

export default function TokenContextPage() {
  redirect("/ghostmind?context=token");
}
