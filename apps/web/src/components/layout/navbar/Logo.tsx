import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 select-none">
      <div className="w-10 h-10 flex items-center justify-center">
        <Image src="/proyekto.png" alt="Logo" width={30} height={30} priority />
      </div>

      <span className="text-foreground font-bold tracking-tight">
        pro<span className="text-accent">yekto</span>
      </span>
    </Link>
  );
}
