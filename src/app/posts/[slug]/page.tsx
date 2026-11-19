import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost, getAdjacent, formatDate } from "@/lib/posts";
import { renderMdx } from "@/lib/mdx";
import { site } from "@/site.config";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/posts/${post.slug}`,
      publishedTime: post.date.toISOString(),
      modifiedTime: (post.updated ?? post.date).toISOString(),
      authors: [site.author],
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const content = await renderMdx(post.body);
  const { newer, older } = getAdjacent(post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date.toISOString(),
    dateModified: (post.updated ?? post.date).toISOString(),
    author: { "@type": "Person", name: site.author, url: site.links.portfolio },
    url: `${site.url}/posts/${post.slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <article className="post">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header>
        <p className="meta">
          <time dateTime={post.date.toISOString()}>{formatDate(post.date)}</time>
          <span>{post.readingMinutes} min read</span>
          {post.updated && <span>Updated {formatDate(post.updated)}</span>}
        </p>
        <h1>{post.title}</h1>
        <p className="lede">{post.description}</p>
        <div className="meta">{post.tags.map((t) => <Link key={t} href={`/tags/${t}`} className="tag">#{t}</Link>)}</div>
      </header>
      <div className="prose">{content}</div>
      <nav className="pager" aria-label="More posts">
        {older ? <Link href={`/posts/${older.slug}`}><small>Older</small>{older.title}</Link> : <span />}
        {newer ? <Link href={`/posts/${newer.slug}`} className="next"><small>Newer</small>{newer.title}</Link> : <span />}
      </nav>
    </article>
  );
}
