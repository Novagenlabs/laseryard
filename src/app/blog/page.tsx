import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog | Laser Yard",
  description:
    "Guides, tips, and insights on metal business cards, laser engraving, NFC technology, and making a lasting impression.",
  alternates: { canonical: "https://laseryard.com/blog" },
};

export default function BlogPage() {
  const schemas = [
    breadcrumbSchema([
      { name: "Home", url: SITE_CONFIG.url },
      { name: "Blog", url: `${SITE_CONFIG.url}/blog` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />

      <section className="pt-40 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ArrowRight className="w-3 h-3" aria-hidden />
              <span className="text-foreground">Blog</span>
            </nav>

            <div className="max-w-2xl">
              <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                Blog
              </h1>
              <p className="text-muted-foreground text-lg">
                Guides and insights on metal business cards, laser engraving,
                and making a lasting first impression.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <ScrollReveal key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block h-full"
                >
                  <article className="h-full p-6 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-colors">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className="font-[family-name:var(--font-montserrat)] text-lg font-bold tracking-tight mb-3 group-hover:text-foreground/80 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {post.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full bg-foreground/5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
