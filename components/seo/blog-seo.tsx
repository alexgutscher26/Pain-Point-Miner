import React from "react";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { siteUrl } from "@/lib/seo";

interface BlogPostSeoProps {
  title: string;
  description: string;
  slug: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}

export function BlogPostSeo({
  title,
  description,
  slug,
  datePublished = "2026-07-01",
  dateModified = "2026-08-15",
  author = "ThreddIQ Research Team",
}: BlogPostSeoProps) {
  const url = `${siteUrl}/blog/${slug}`;
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&badge=Blog+Post&category=ThreddIQ+Research`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Blog", item: "/blog" },
          { name: title, item: `/blog/${slug}` },
        ]}
      />
      <BlogPostJsonLd
        title={title}
        description={description}
        url={url}
        datePublished={datePublished}
        dateModified={dateModified}
        author={author}
        imageUrl={ogImageUrl}
      />
    </>
  );
}
