import type { Post } from "./posts";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Builds an RSS 2.0 feed. Kept separate from the route so it can be unit tested. */
export function buildRss({ title, description, url, author }: { title: string; description: string; url: string; author: string }, posts: Post[]) {
  const items = posts
    .map((p) => {
      const link = `${url}/posts/${p.slug}`;
      return `    <item>
      <title>${escape(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <description>${escape(p.description)}</description>
${p.tags.map((t) => `      <category>${escape(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(title)}</title>
    <link>${url}</link>
    <description>${escape(description)}</description>
    <language>en</language>
    <copyright>© ${new Date().getFullYear()} ${escape(author)}</copyright>
    <atom:link href="${url}/rss.xml" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${posts[0].date.toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;
}
