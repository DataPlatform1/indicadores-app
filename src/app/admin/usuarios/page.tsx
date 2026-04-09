import { redirect } from "next/navigation";
import UsuariosAdminClient from "@/app/admin/usuarios/usuarios-admin-client";
import { getCurrentSession } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";

export default async function AdminUsuariosPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageUsers(session.role)) {
    redirect("/sin-acceso");
  }

  return <UsuariosAdminClient />;
}
