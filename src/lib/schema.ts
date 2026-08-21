import {
  SITE_CONFIG,
  TESTIMONIAL_STATS,
  COUNTRIES,
  WHATSAPP_NUMBER,
} from "@/lib/constants";

const BASE_URL = SITE_CONFIG.url;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: BASE_URL,
    logo: `${BASE_URL}/images/laseryard_logos/logo_light.png`,
    description: SITE_CONFIG.description,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: `+${WHATSAPP_NUMBER}`,
        contactType: "customer service",
        availableLanguage: "English",
      },
      {
        "@type": "ContactPoint",
        email: "hello@laseryard.com",
        contactType: "customer service",
      },
    ],
    areaServed: COUNTRIES.map((c) => ({
      "@type": "Country",
      name: c.name,
    })),
    sameAs: [],
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: SITE_CONFIG.name,
    url: BASE_URL,
    logo: `${BASE_URL}/images/laseryard_logos/logo_light.png`,
    image: `${BASE_URL}/og-image.jpg`,
    description: SITE_CONFIG.description,
    telephone: `+${WHATSAPP_NUMBER}`,
    email: "hello@laseryard.com",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "16:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: TESTIMONIAL_STATS.averageRating,
      reviewCount: TESTIMONIAL_STATS.totalClients,
      bestRating: 5,
    },
    priceRange: "$$",
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        item: `${BASE_URL}${item.url}`,
      })),
    ],
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function productSchema(opts: {
  name: string;
  description: string;
  image: string;
  material?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    image: `${BASE_URL}${opts.image}`,
    url: `${BASE_URL}${opts.url}`,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    ...(opts.material && { material: opts.material }),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: TESTIMONIAL_STATS.averageRating,
      reviewCount: TESTIMONIAL_STATS.totalClients,
      bestRating: 5,
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      url: `${BASE_URL}${opts.url}`,
    },
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: `${BASE_URL}${opts.url}`,
    provider: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: BASE_URL,
    },
    areaServed: COUNTRIES.map((c) => ({
      "@type": "Country",
      name: c.name,
    })),
    serviceType: "Laser Engraving",
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function webApplicationSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: opts.name,
    description: opts.description,
    url: `${BASE_URL}${opts.url}`,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
    },
  };
}

export function itemListSchema(
  items: { name: string; url: string; position: number }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      url: `${BASE_URL}${item.url}`,
      name: item.name,
    })),
  };
}
