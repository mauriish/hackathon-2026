import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/check", label: "Check" },
  { href: "/report", label: "Report" },
  { href: "/protect", label: "Protect" },
];

export function SiteHeader() {
  return (
    <header className="bg-petroleum text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg text-white"
          aria-label="Prevención Mayor, ir al inicio"
        >
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-xl bg-white object-contain p-1"
          />
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            Prevención Mayor
          </span>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex items-center gap-1 text-sm font-medium sm:gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-3 text-white/90 hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
