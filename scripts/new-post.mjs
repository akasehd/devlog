// Usage: npm run new "My post title"
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new "My post title"');
  process.exit(1);
}

const slug = title.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const dir = join(process.cwd(), "content", "posts");
const file = join(dir, `${slug}.mdx`);
if (existsSync(file)) {
  console.error(`${file} already exists`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });
const today = new Date().toISOString().slice(0, 10);
writeFileSync(file, `---\ntitle: ${JSON.stringify(title)}\ndescription: ""\ndate: ${today}\ntags: []\ndraft: true\n---\n\nStart writing here.\n`);
console.log(`Created content/posts/${slug}.mdx (draft)`);
