export type NavPageLayout = "hero-text" | "hero-gallery" | "simple";

export interface BlockStyles {
  paddingY?: "none" | "sm" | "md" | "lg" | "xl";
  animation?: "none" | "fade-in" | "slide-up";
  textAlign?: "left" | "center" | "right";
  theme?: "light" | "dark" | "blue" | "gray";
}

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
      styles?: BlockStyles;
    }
  | {
      id: string;
      type: "richText";
      html: string;
      width?: "full" | "half";
      styles?: BlockStyles;
    }
  | {
      id: string;
      type: "gallery";
      title?: string;
      images: Array<{ url: string; caption?: string; size?: "sm" | "md" | "lg" | "xl" }>;
      columns?: number;
      width?: "full" | "half";
      styles?: BlockStyles;
    }
  | {
      id: string;
      type: "carousel";
      title?: string;
      images: Array<{ url: string; caption?: string; size?: "sm" | "md" | "lg" | "xl" }>;
      animation?: "slide" | "fade" | "coverflow";
      size?: "sm" | "md" | "lg" | "xl";
      width?: "full" | "half";
      autoplay?: boolean;
      interval?: number;
      styles?: BlockStyles;
    }
  | {
      id: string;
      type: "cards_grid";
      title?: string;
      columns?: number;
      cards: Array<{
        id: string;
        title: string;
        description?: string;
        imageUrl?: string;
        buttonText?: string;
        modalTitle?: string;
        modalContent?: string;
        modalImages?: string[];
        titleFont?: string;
        descFont?: string;
        titleSize?: string;
        descSize?: string;
        featured?: boolean;
      }>;
      width?: "full" | "half";
      styles?: BlockStyles;
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
      styles?: BlockStyles;
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