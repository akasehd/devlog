import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.title}` },
  description: site.description,
  authors: [{ name: site.author, url: site.links.portfolio }],
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
  openGraph: { type: "website", siteName: site.title, title: site.title, description: site.description },
  twitter: { card: "summary" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#content">Skip to content</a>
        <header className="site-header">
          <div className="wrap row">
            <Link href="/" className="brand">{site.title}</Link>
            <nav>
              <Link href="/">Posts</Link>
              <Link href="/tags">Tags</Link>
              <a href="/rss.xml">RSS</a>
              <a href={site.links.portfolio}>About</a>
            </nav>
          </div>
        </header>
        <main id="content" className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap row">
            <span>© {new Date().getFullYear()} {site.author}</span>
            <span><a href={site.links.github}>GitHub</a> · <a href="/rss.xml">RSS</a></span>
          </div>
        </footer>
      </body>
    </html>
  );
}
