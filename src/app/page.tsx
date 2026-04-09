import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { canSubmit } from "@/lib/roles";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (canSubmit(session.role)) {
    redirect("/formulario");
  }

  redirect("/sin-acceso");
}
