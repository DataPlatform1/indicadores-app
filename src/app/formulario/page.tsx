import { redirect } from "next/navigation";
import FormularioIndicadores from "@/app/_components/formulario-indicadores";
import { getCurrentSession } from "@/lib/auth";
import { canSubmit } from "@/lib/roles";

export default async function FormularioPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canSubmit(session.role)) {
    redirect("/sin-acceso");
  }

  return <FormularioIndicadores />;
}
