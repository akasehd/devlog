import { getAllPosts } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { site } from "@/site.config";

export default function Home() {
  const posts = getAllPosts();
  return (
    <>
      <section className="intro">
        <h1>{site.title}</h1>
        <p>{site.description} Written by <a href={site.links.portfolio}>{site.author}</a>.</p>
      </section>
      <PostList posts={posts} />
    </>
  );
}
