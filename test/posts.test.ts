import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getAllPosts, getAllTags, getAdjacent, getPostsByTag, parsePost, readingMinutes } from "@/lib/posts";
import { buildRss } from "@/lib/feed";
import { renderMdx } from "@/lib/mdx";
import { renderToStaticMarkup } from "react-dom/server";

let dir: string;
const write = (name: string, fm: string, body = "Hello world.") => writeFileSync(join(dir, name), `---\n${fm}\n---\n\n${body}\n`);

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "devlog-"));
  process.env.CONTENT_DIR = dir;
  write("older-post.mdx", "title: Older\ndescription: The first one\ndate: 2026-01-01\ntags: [Next.js, react]");
  write("newer-post.mdx", "title: Newer\ndescription: The second one\ndate: 2026-02-01\ntags: [react]");
  write("secret.mdx", "title: Draft\ndescription: Not yet\ndate: 2026-03-01\ndraft: true");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  delete process.env.CONTENT_DIR;
  (process.env as Record<string, string>).NODE_ENV = "test";
});

describe("posts", () => {
  it("sorts newest first and includes drafts outside production", () => {
    expect(getAllPosts().map((p) => p.slug)).toEqual(["secret", "newer-post", "older-post"]);
  });

  it("hides drafts in production", () => {
    (process.env as Record<string, string>).NODE_ENV = "production";
    expect(getAllPosts().map((p) => p.slug)).toEqual(["newer-post", "older-post"]);
  });

  it("normalizes tags and counts them", () => {
    expect(getAllTags()).toEqual([{ tag: "react", count: 2 }, { tag: "next.js", count: 1 }]);
    expect(getPostsByTag("React").map((p) => p.slug)).toEqual(["newer-post", "older-post"]);
  });

  it("finds adjacent posts", () => {
    const { newer, older } = getAdjacent("newer-post");
    expect(newer?.slug).toBe("secret");
    expect(older?.slug).toBe("older-post");
  });

  it("rejects missing frontmatter with a readable error", () => {
    expect(() => parsePost("broken", "---\ntitle: Only a title\n---\nBody")).toThrow(/description/);
  });

  it("rejects filenames that wouldn't make clean URLs", () => {
    expect(() => parsePost("Bad Name", "---\ntitle: x\ndescription: y\ndate: 2026-01-01\n---\n")).toThrow(/Invalid post filename/);
  });

  it("estimates reading time, counting code more slowly", () => {
    const prose = Array(460).fill("word").join(" ");
    expect(readingMinutes(prose)).toBe(2);
    const code = "```\n" + Array(240).fill("x").join(" ") + "\n```";
    expect(readingMinutes(code)).toBe(2);
    expect(readingMinutes("short")).toBe(1);
  });
});

describe("rss", () => {
  it("escapes content and links every post", () => {
    const posts = getAllPosts().filter((p) => !p.draft);
    posts[0].title = `Tom & Jerry's <script>`;
    const xml = buildRss({ title: "Blog", description: "d", url: "https://example.com", author: "Me" }, posts);
    expect(xml).toContain("<title>Tom &amp; Jerry&apos;s &lt;script&gt;</title>");
    expect(xml).toContain("<link>https://example.com/posts/older-post</link>");
    expect(xml.match(/<item>/g)).toHaveLength(2);
  });
});

describe("mdx", () => {
  it("renders headings with anchors, highlighted code and callouts", async () => {
    const html = renderToStaticMarkup(
      await renderMdx('## Hello there\n\n```ts\nconst x: number = 1;\n```\n\n<Callout type="tip">Be nice</Callout>\n\n[ext](https://example.com)'),
    );
    expect(html).toContain('id="hello-there"');
    expect(html).toContain("data-rehype-pretty-code-figure");
    expect(html).toContain("--shiki-dark");
    expect(html).toContain('class="callout callout-tip"');
    expect(html).toContain('target="_blank"');
  });
});
