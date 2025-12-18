export interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  active: boolean;
}

export type HeroSlideCreateInput = Omit<HeroSlide, "id">;
export type HeroSlideUpdateInput = Partial<HeroSlideCreateInput>;
