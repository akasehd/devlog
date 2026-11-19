import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { site } from "@/site.config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().filter((p) => !p.draft);
  return [
    { url: site.url, lastModified: posts[0]?.date },
    { url: `${site.url}/tags` },
    ...posts.map((p) => ({ url: `${site.url}/posts/${p.slug}`, lastModified: p.updated ?? p.date })),
    ...getAllTags().map(({ tag }) => ({ url: `${site.url}/tags/${tag}` })),
  ];
}
