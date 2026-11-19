import Link from "next/link";
import { formatDate, type Post } from "@/lib/posts";

export function PostList({ posts }: { posts: Post[] }) {
  if (!posts.length) return <p className="muted">No posts yet.</p>;
  return (
    <ol className="post-list">
      {posts.map((p) => (
        <li key={p.slug}>
          <time dateTime={p.date.toISOString()}>{formatDate(p.date)}</time>
          <div>
            <h2><Link href={`/posts/${p.slug}`}>{p.title}</Link>{p.draft && <span className="draft">Draft</span>}</h2>
            <p>{p.description}</p>
            <div className="meta">
              <span>{p.readingMinutes} min read</span>
              {p.tags.map((t) => <Link key={t} href={`/tags/${t}`} className="tag">#{t}</Link>)}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
