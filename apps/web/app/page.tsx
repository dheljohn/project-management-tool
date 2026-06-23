import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { JSX } from "react";

interface ThemeImageProps extends Omit<ImageProps, "src"> {
  srcLight: string;
  srcDark: string;
}

const ThemeImage: React.FC<ThemeImageProps> = (props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      {/* Tailwind handles light/dark mode display toggles */}
      <Image {...rest} src={srcLight} className="block dark:hidden" />
      <Image {...rest} src={srcDark} className="hidden dark:block" />
    </>
  );
};

export default function Home(): JSX.Element {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-md w-full">
        <ThemeImage
          srcLight="/turborepo-dark.svg"
          srcDark="/turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />

        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-zinc-600 dark:text-zinc-400 space-y-2">
          <li>Welcome to the Member Portal.</li>
          <li>Choose an authentication route below to continue.</li>
        </ol>

        {/* Tailwind Styled Navigation Action Buttons */}
        <div className="flex gap-4 items-center flex-col sm:flex-row w-full">
          <Link
            href="/login"
            className="rounded-full border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto font-medium"
          >
            Go to Sign In
          </Link>

          <Link
            href="/register"
            className="rounded-full border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto font-medium"
          >
            Register Account
          </Link>
        </div>

        <Button
          appName="web"
          className="rounded-full border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-center text-xs h-8 px-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          System Status
        </Button>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm text-zinc-500">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://turborepo.dev?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
            className="dark:invert"
          />
          Go to docs.dev →
        </a>
      </footer>
    </div>
  );
}
