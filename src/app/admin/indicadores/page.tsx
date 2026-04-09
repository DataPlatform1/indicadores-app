import { redirect } from "next/navigation";
import IndicadoresAdminClient from "@/app/admin/indicadores/indicadores-admin-client";
import { getCurrentSession } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";

export default async function AdminIndicadoresPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageUsers(session.role)) {
    redirect("/sin-acceso");
  }

  return <IndicadoresAdminClient />;
}
