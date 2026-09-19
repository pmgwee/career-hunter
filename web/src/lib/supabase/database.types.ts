export type Database = {
  public: {
    Tables: {
      career_workspaces: {
        Row: { id: string; owner_id: string; name: string; slug: string; revision: number; created_at: string; updated_at: string };
        Insert: { id?: string; owner_id: string; name?: string; slug?: string; revision?: number; created_at?: string; updated_at?: string };
        Update: { name?: string; slug?: string; updated_at?: string };
        Relationships: [];
      };
      career_files: {
        Row: { id: string; workspace_id: string; owner_id: string; path: string; content: string; content_type: string; sha256: string; revision: number; source: string; deleted_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; workspace_id: string; owner_id: string; path: string; content?: string; content_type?: string; sha256: string; revision?: number; source?: string; deleted_at?: string | null; created_at?: string; updated_at?: string };
        Update: { content?: string; content_type?: string; sha256?: string; source?: string; deleted_at?: string | null; updated_at?: string };
        Relationships: [];
      };
      career_artifacts: {
        Row: { id: string; workspace_id: string; owner_id: string; path: string; object_name: string; mime_type: string; size_bytes: number; sha256: string; revision: number; source: string; deleted_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; workspace_id: string; owner_id: string; path: string; object_name: string; mime_type?: string; size_bytes?: number; sha256: string; revision?: number; source?: string; deleted_at?: string | null; created_at?: string; updated_at?: string };
        Update: { object_name?: string; mime_type?: string; size_bytes?: number; sha256?: string; source?: string; deleted_at?: string | null; updated_at?: string };
        Relationships: [];
      };
      career_changes: {
        Row: { id: number; workspace_id: string; owner_id: string; revision: number; entity_type: string; path: string; operation: string; sha256: string | null; source: string; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      career_sync_tokens: {
        Row: { id: string; workspace_id: string; owner_id: string; name: string; token_hash: string; last_used_at: string | null; expires_at: string | null; revoked_at: string | null; created_at: string };
        Insert: { id?: string; workspace_id: string; owner_id: string; name?: string; token_hash: string; last_used_at?: string | null; expires_at?: string | null; revoked_at?: string | null; created_at?: string };
        Update: { name?: string; last_used_at?: string | null; expires_at?: string | null; revoked_at?: string | null };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
