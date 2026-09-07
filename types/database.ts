export type PoemRow = {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string;
  content: string;
  place: string;
  tags: string[];
  poem_date: string;
  featured: boolean;
  featured_order: number;
  mood: string;
  accent: string;
  series: string | null;
  language: string;
  demo: boolean;
  phrase: string | null;
  status: 'draft' | 'published';
  publish_at: string | null;
  created_at: string;
  updated_at: string;
};
export type PoemInsert = Omit<PoemRow, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};
export interface Database {
  public: {
    Tables: {
      poems: {
        Row: PoemRow;
        Insert: PoemInsert;
        Update: Partial<PoemInsert>;
        Relationships: [];
      };
      admin_users: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
