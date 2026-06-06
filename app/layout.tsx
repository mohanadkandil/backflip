import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Backflip — background removal + horizontal flip",
  description:
    "Upload an image. We remove the background and flip it horizontally. Free, fast, no signup.",
  openGraph: {
    title: "Backflip",
    description: "Background removal + horizontal flip in one shot.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="font-mono text-sm font-semibold tracking-tight"
            >
              ↺ backflip
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link
                href="/dashboard"
                className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)] transition-colors"
              >
                My images
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)] transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t py-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-6 text-xs text-[color:var(--color-muted-foreground)] font-mono sm:flex-row">
            <span>backflip · bg removal + horizontal flip</span>
            <span>cloudflare workers ai · r2 · neon</span>
          </div>
        </footer>
        <Toaster
          richColors
          position="bottom-right"
          toastOptions={{
            style: { fontFamily: "var(--font-geist-sans)" },
          }}
        />
      </body>
    </html>
  );
}
