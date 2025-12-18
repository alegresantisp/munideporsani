export type NavPageLayout = "hero-text" | "hero-gallery" | "simple";

export type NavPageBlock =
  | {
      id: string;
      type: "hero";
      title: string;
      subtitle?: string;
      imageUrl?: string;
      ctaLabel?: string;
      ctaHref?: string;
      width?: never;
    }
  | {
      id: string;
      type: "richText";
      html: string;
      width?: "full" | "half";
    }
  | {
      id: string;
      type: "gallery";
      images: Array<{ url: string; caption?: string; size?: "sm" | "md" | "lg" }>;
      columns?: number;
      width?: "full" | "half";
    }
  | {
      id: string;
      type: "carousel";
      images: Array<{ url: string; caption?: string; size?: "sm" | "md" | "lg" }>;
      width?: "full" | "half";
    }
  | {
      id: string;
      type: "cta";
      title: string;
      description?: string;
      href?: string;
      label?: string;
      imageUrl?: string;
      width?: "full" | "half";
    }
  | {
      id: string;
      type: "spacer";
      width?: "full" | "half";
    };

export interface NavPageContent {
  path: string; // ejemplo: /delegaciones/martinez
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  layout?: NavPageLayout;
  sections?: never; // legacy
  blocks?: NavPageBlock[];
  updatedAt: string;
}

export type NavPageUpsertInput = Omit<NavPageContent, "updatedAt">;