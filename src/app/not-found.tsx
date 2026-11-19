import Link from "next/link";

export default function NotFound() {
  return (
    <section className="intro">
      <h1>Not found</h1>
      <p>That post doesn&apos;t exist. <Link href="/">See all posts</Link>.</p>
    </section>
  );
}
