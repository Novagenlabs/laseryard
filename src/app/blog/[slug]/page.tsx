import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { SITE_CONFIG } from "@/lib/constants";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Laser Yard`,
    description: post.description,
    alternates: { canonical: `https://laseryard.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://laseryard.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

function articleSchema(post: NonNullable<ReturnType<typeof getBlogPost>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Laser Yard",
      url: SITE_CONFIG.url,
    },
    publisher: {
      "@type": "Organization",
      name: "Laser Yard",
      url: SITE_CONFIG.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/images/laseryard_logos/logo_light.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost =
    currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  const schemas = [
    articleSchema(post),
    breadcrumbSchema([
      { name: "Home", url: SITE_CONFIG.url },
      { name: "Blog", url: `${SITE_CONFIG.url}/blog` },
      { name: post.title, url: `${SITE_CONFIG.url}/blog/${post.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />

      <article className="pt-40 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ArrowRight className="w-3 h-3" aria-hidden />
              <Link
                href="/blog"
                className="hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <ArrowRight className="w-3 h-3" aria-hidden />
              <span className="text-foreground line-clamp-1">{post.title}</span>
            </nav>

            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
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

            <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
              {post.title}
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed mb-12">
              {post.description}
            </p>
          </ScrollReveal>

          <div className="space-y-10">
            {post.sections.map((section, i) => (
              <ScrollReveal key={i}>
                <section>
                  <h2 className="font-[family-name:var(--font-montserrat)] text-xl sm:text-2xl font-bold tracking-tight mb-4">
                    {section.heading}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.body}
                  </p>
                </section>
              </ScrollReveal>
            ))}
          </div>

          {/* Tags */}
          <ScrollReveal>
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full bg-foreground/5 text-sm text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal>
            <div className="mt-12 p-8 rounded-2xl bg-card border border-border text-center">
              <h3 className="font-[family-name:var(--font-montserrat)] text-xl font-bold mb-3">
                Ready to order your metal business cards?
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                Message us on WhatsApp for a quote, or try the Design Studio to
                preview your card in 3D.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <WhatsAppCTA
                  buttonText="Get a Quote"
                  message="Hi! I just read your blog and I'm interested in metal business cards. Can you help me with pricing?"
                  trackingLabel={`blog-${post.slug}`}
                />
                <Link
                  href="/unforgettable/design-studio"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:border-foreground/30 transition-colors group"
                >
                  Design Studio
                  <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Prev/Next */}
          {(prevPost || nextPost) && (
            <ScrollReveal>
              <div className="mt-12 grid sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}`}
                    className="group p-5 rounded-xl border border-border hover:border-foreground/20 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <ArrowLeft className="w-3 h-3" /> Previous
                    </span>
                    <p className="text-sm font-medium group-hover:text-foreground/80 transition-colors line-clamp-2">
                      {prevPost.title}
                    </p>
                  </Link>
                ) : (
                  <div />
                )}
                {nextPost && (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="group p-5 rounded-xl border border-border hover:border-foreground/20 transition-colors text-right"
                  >
                    <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mb-2">
                      Next <ArrowRight className="w-3 h-3" />
                    </span>
                    <p className="text-sm font-medium group-hover:text-foreground/80 transition-colors line-clamp-2">
                      {nextPost.title}
                    </p>
                  </Link>
                )}
              </div>
            </ScrollReveal>
          )}
        </div>
      </article>
    </>
  );
}
