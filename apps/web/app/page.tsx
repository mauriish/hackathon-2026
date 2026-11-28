import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <h1 className="sr-only">Prevención Mayor</h1>
      <Image
        src="/logo.png"
        alt="Logo de Prevención Mayor"
        width={180}
        height={180}
        priority
        className="h-auto w-40 max-w-full object-contain sm:w-52"
      />
      <Link
        href="/check"
        className={buttonVariants({
          size: "lg",
          className: "mt-12 min-h-12 w-full max-w-xs text-base",
        })}
      >
        Entrar a Check
      </Link>
    </main>
  );
}
