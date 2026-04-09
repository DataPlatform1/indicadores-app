import { redirect } from "next/navigation";
import DisenoAdminClient from "@/app/admin/diseno/diseno-admin-client";
import { getCurrentSession } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";

export default async function AdminDisenoPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageUsers(session.role)) {
    redirect("/sin-acceso");
  }

  return <DisenoAdminClient />;
}
