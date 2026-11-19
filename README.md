# DevLog

A fast, statically generated developer blog built with Next.js. Posts are MDX files in the repository, compiled at build time into plain HTML with syntax highlighting, so the deployed site is static pages and nothing else.

## Features

- **MDX posts**: Markdown with GitHub Flavored Markdown (tables, task lists, footnotes) plus React components such as `<Callout>`
- **Syntax highlighting at build time** with [Shiki](https://shiki.style) through `rehype-pretty-code`: light and dark themes, titles and highlighted lines, zero client JavaScript
- **Validated frontmatter**: a typo in a post's date or a missing description fails the build with a clear message instead of shipping a broken page
- **Drafts** that appear in development and stay out of production builds, RSS and the sitemap
- **Tags** with their own pages, **RSS 2.0** feed, **sitemap.xml**, **robots.txt**
- **SEO**: canonical URLs, Open Graph article metadata and `BlogPosting` JSON-LD on every post
- **Reading time**, previous and next post navigation, heading anchors, and a light and dark theme that follows the reader's system setting

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The draft post "Writing posts in DevLog" is visible in development and documents every formatting feature.

## Writing a post

```bash
npm run new "Shipping a zero-dependency Node.js app"
```

This creates `content/posts/shipping-a-zero-dependency-node-js-app.mdx` as a draft:

~~~mdx
---
title: "Shipping a zero-dependency Node.js app"
description: "One or two sentences for lists, RSS and social cards."
date: 2026-11-19
tags: [nodejs, architecture]
draft: true
---

Your post here. Fenced code blocks are highlighted:

```ts title="server.ts" {2}
import { createServer } from "node:http";
createServer((req, res) => res.end("ok")).listen(3000);
```

<Callout type="tip">Components work without imports.</Callout>
~~~

Remove `draft: true` to publish. The filename becomes the URL.

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | |
| `description` | Yes | Up to 300 characters |
| `date` | Yes | `YYYY-MM-DD` |
| `updated` | No | Shown on the post and used in the sitemap |
| `tags` | No | Lowercased automatically |
| `draft` | No | Hidden in production unless `SHOW_DRAFTS=1` |

## Configuration

Edit [`src/site.config.ts`](src/site.config.ts) for the blog title, description, author and links. Set `SITE_URL` when building for production so canonical URLs, RSS and the sitemap point at your domain:

```bash
SITE_URL=https://blog.example.com npm run build
```

## Project structure

```
content/posts/          MDX posts (filename = URL slug)
src/
  site.config.ts        Title, author, links
  lib/posts.ts          Loading, validation, sorting, tags, reading time
  lib/mdx.tsx           MDX compilation and the remark/rehype pipeline
  lib/feed.ts           RSS builder
  components/           Post list and Callout
  app/                  Home, posts/[slug], tags, tags/[tag], rss.xml, sitemap, robots
scripts/new-post.mjs    Post scaffolding
test/                   Tests for loading, drafts, tags, RSS escaping and MDX rendering
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with drafts |
| `npm run build` | Static production build |
| `npm start` | Serve the production build |
| `npm run new "Title"` | Create a draft post |
| `npm test` | Tests |
| `npm run typecheck` | TypeScript check |

## Deployment

Every page is prerendered, so DevLog deploys anywhere that runs Next.js, including Vercel, Netlify and Cloudflare. On Vercel, import the repository and set `SITE_URL`. Each push to `main` publishes the new posts.

## License

MIT © Raymond Pingol Blanco Jr. The posts in `content/posts` are © Raymond Pingol Blanco Jr., all rights reserved.
