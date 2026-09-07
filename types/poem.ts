export type Accent = 'violet' | 'pink' | 'cyan' | 'gold' | 'stone' | 'green';
export interface Poem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  place: string;
  tags: string[];
  date: string;
  featured: boolean;
  mood: string;
  accent: Accent;
  series: string | null;
  language: string;
  demo: boolean;
  phrase?: string;
  status?: 'draft' | 'published';
  publishAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  featuredOrder?: number;
}
export interface Place {
  slug: string;
  name: string;
  description: string;
  feelings: string;
  accent: Accent;
}
