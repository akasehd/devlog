import { getAllPosts } from "@/lib/posts";
import { buildRss } from "@/lib/feed";
import { site } from "@/site.config";

export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts().filter((p) => !p.draft);
  return new Response(buildRss(site, posts), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
