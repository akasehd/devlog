import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { Callout } from "@/components/callout";

const prettyCode: PrettyCodeOptions = {
  // Two themes, switched with CSS based on the reader's color scheme.
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  keepBackground: false,
  defaultLang: { block: "plaintext" },
};

/** Components available inside every post without importing them. */
const components = {
  Callout,
  a: (props: React.ComponentProps<"a">) => {
    const external = props.href?.startsWith("http");
    return <a {...props} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} />;
  },
};

/** Compiles MDX to a React element on the server at build time. */
export async function renderMdx(source: string) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["anchor"] } }],
      [rehypePrettyCode, prettyCode],
    ],
  });
  return <Content components={components} />;
}
