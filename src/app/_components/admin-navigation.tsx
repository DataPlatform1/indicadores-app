import Link from "next/link";

type AdminNavigationProps = {
  currentPath: string;
  eyebrow?: string;
  title: string;
  description: string;
};

const navItems = [
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    description: "Accesos, roles y estado de cuentas.",
  },
  {
    href: "/admin/indicadores",
    label: "Indicadores",
    description: "Metas, variables y configuracion operativa.",
  },
  {
    href: "/admin/diseno",
    label: "Diseno",
    description: "Textos, identidad visual y apariencia general.",
  },
  {
    href: "/admin/auditoria",
    label: "Auditoria",
    description: "Bitacora de cambios, accesos y trazabilidad.",
  },
  {
    href: "/registros",
    label: "Historial",
    description: "Consulta de registros enviados al sistema.",
  },
  {
    href: "/formulario",
    label: "Formulario",
    description: "Volver al flujo principal de captura.",
  },
];

function isActive(currentPath: string, href: string) {
  if (href === "/formulario") {
    return false;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function AdminNavigation({
  currentPath,
  eyebrow = "Panel administrativo",
  title,
  description,
}: AdminNavigationProps) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_30px_80px_rgba(20,38,62,0.12)] backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-900">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="rounded-[1.5rem] bg-slate-950 px-5 py-4 text-sm text-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
            Centro admin
          </p>
          <p className="mt-2 max-w-xs leading-6">
            Desde aqui deberias poder moverte entre administracion, historial y
            auditoria sin perderte dentro de cada modulo.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {navItems.map((item) => {
          const active = isActive(currentPath, item.href);

          return (
            <Link
              className={`rounded-[1.5rem] border px-5 py-4 transition ${
                active
                  ? "border-slate-900 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                  : "border-slate-200 bg-white text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              }`}
              href={item.href}
              key={item.href}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.18em] ${
                    active ? "text-cyan-300" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </p>
                {active ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    Actual
                  </span>
                ) : null}
              </div>
              <p
                className={`mt-3 text-sm leading-6 ${
                  active ? "text-slate-200" : "text-slate-600"
                }`}
              >
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
