export interface MissionContent {
  title: string;
  body: string;
  author?: string;
  role?: string;
  organization?: string;
  imageUrl?: string;
}

export type MissionUpdateInput = Partial<MissionContent>;
