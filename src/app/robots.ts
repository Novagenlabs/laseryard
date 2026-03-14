import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "PerplexityBot",
          "Google-Extended",
          "Bingbot",
          "Applebot",
          "Applebot-Extended",
          "cohere-ai",
          "meta-externalagent",
        ],
        allow: "/",
      },
    ],
    sitemap: "https://laseryard.com/sitemap.xml",
  };
}
