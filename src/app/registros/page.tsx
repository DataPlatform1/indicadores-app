import { redirect } from "next/navigation";
import RegistrosClient from "@/app/registros/registros-client";
import { getCurrentSession } from "@/lib/auth";
import { canViewHistory } from "@/lib/roles";

export default async function RegistrosPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canViewHistory(session.role)) {
    redirect("/sin-acceso");
  }

  return <RegistrosClient />;
}
