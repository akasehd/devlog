import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = { title: "Tags" };

export default function Tags() {
  const tags = getAllTags();
  return (
    <>
      <section className="intro"><h1>Tags</h1><p>Browse posts by topic.</p></section>
      <ul className="tag-cloud">
        {tags.map(({ tag, count }) => (
          <li key={tag}><Link href={`/tags/${tag}`} className="tag">#{tag} <span>{count}</span></Link></li>
        ))}
      </ul>
    </>
  );
}
