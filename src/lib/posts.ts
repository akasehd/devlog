import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const frontmatter = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(300),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string().trim().toLowerCase()).default([]),
  draft: z.boolean().default(false),
});

export type Post = z.infer<typeof frontmatter> & {
  slug: string;
  body: string;
  readingMinutes: number;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const contentDir = () => process.env.CONTENT_DIR ?? join(process.cwd(), "content", "posts");

/** Words per minute for technical writing; code blocks count at a slower pace. */
export function readingMinutes(markdown: string): number {
  const code = markdown.match(/```[\s\S]*?```/g)?.join(" ") ?? "";
  const prose = markdown.replace(/```[\s\S]*?```/g, " ");
  const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words(prose) / 230 + words(code) / 120));
}

export function parsePost(slug: string, raw: string): Post {
  if (!SLUG.test(slug)) throw new Error(`Invalid post filename "${slug}". Use lowercase-words-with-dashes.mdx`);
  const { data, content } = matter(raw);
  const parsed = frontmatter.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".") || "frontmatter"}: ${i.message}`).join("; ");
    throw new Error(`Invalid frontmatter in ${slug}.mdx: ${issues}`);
  }
  return { ...parsed.data, slug, body: content, readingMinutes: readingMinutes(content) };
}

const includeDrafts = () => process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "1";

/** All published posts, newest first. Drafts appear only in development. */
export function getAllPosts(): Post[] {
  const dir = contentDir();
  // Content is read at build time; outputFileTracingIncludes ships it for any runtime reads.
  if (!existsSync(/* turbopackIgnore: true */ dir)) return [];
  return readdirSync(/* turbopackIgnore: true */ dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => parsePost(f.replace(/\.mdx?$/, ""), readFileSync(join(/* turbopackIgnore: true */ dir, f), "utf8")))
    .filter((p) => includeDrafts() || !p.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime() || a.slug.localeCompare(b.slug));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Tags with post counts, most used first. */
export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of getAllPosts()) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.tags.includes(tag.toLowerCase()));
}

/** The posts before and after a given post in date order. */
export function getAdjacent(slug: string): { newer?: Post; older?: Post } {
  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  return i < 0 ? {} : { newer: all[i - 1], older: all[i + 1] };
}

export const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(d);
