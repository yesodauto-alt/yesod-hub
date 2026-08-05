export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      exclusive_contents: {
        Row: {
          author_id: string
          category: string
          category_i18n: Json
          content_html: string
          content_i18n: Json
          cover_image_url: string | null
          created_at: string
          excerpt: string
          excerpt_i18n: Json
          external_video_url: string | null
          id: string
          media_type: string | null
          media_url: string | null
          published: boolean
          sort_order: number
          title: string
          title_i18n: Json
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          category_i18n?: Json
          content_html?: string
          content_i18n?: Json
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          excerpt_i18n?: Json
          external_video_url?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          published?: boolean
          sort_order?: number
          title: string
          title_i18n: Json
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          category_i18n?: Json
          content_html?: string
          content_i18n?: Json
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          excerpt_i18n?: Json
          external_video_url?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          published?: boolean
          sort_order?: number
          title?: string
          title_i18n?: Json
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name?: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          author_name: string
          category: string
          content: string
          content_i18n: Json
          created_at: string
          external_video_url: string | null
          id: string
          image_url: string | null
          media_type: string | null
          media_url: string | null
          published: boolean
          title: string
          title_i18n: Json
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name?: string
          category?: string
          content: string
          content_i18n: Json
          created_at?: string
          external_video_url?: string | null
          id?: string
          image_url?: string | null
          media_type?: string | null
          media_url?: string | null
          published?: boolean
          title: string
          title_i18n: Json
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string
          category?: string
          content?: string
          content_i18n?: Json
          created_at?: string
          external_video_url?: string | null
          id?: string
          image_url?: string | null
          media_type?: string | null
          media_url?: string | null
          published?: boolean
          title?: string
          title_i18n?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          avatar_url: string | null
          community_goal: string | null
          company: string | null
          created_at: string
          employee_count: number | null
          full_name: string | null
          id: string
          newsletter_opt_in: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          community_goal?: string | null
          company?: string | null
          created_at?: string
          employee_count?: number | null
          full_name?: string | null
          id: string
          newsletter_opt_in?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          community_goal?: string | null
          company?: string | null
          created_at?: string
          employee_count?: number | null
          full_name?: string | null
          id?: string
          newsletter_opt_in?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          automation: Json
          category: Json
          content: Json
          context: Json
          created_at: string
          gallery_urls: string[]
          id: string
          image_url: string | null
          interaction_label: Json
          interaction_type: string
          interaction_url: string | null
          published: boolean
          result: Json
          slug: string
          solution: Json
          sort_order: number
          summary: Json
          title: Json
          updated_at: string
        }
        Insert: {
          automation?: Json
          category?: Json
          content?: Json
          context?: Json
          created_at?: string
          gallery_urls?: string[]
          id?: string
          image_url?: string | null
          interaction_label?: Json
          interaction_type?: string
          interaction_url?: string | null
          published?: boolean
          result?: Json
          slug: string
          solution?: Json
          sort_order?: number
          summary?: Json
          title?: Json
          updated_at?: string
        }
        Update: {
          automation?: Json
          category?: Json
          content?: Json
          context?: Json
          created_at?: string
          gallery_urls?: string[]
          id?: string
          image_url?: string | null
          interaction_label?: Json
          interaction_type?: string
          interaction_url?: string | null
          published?: boolean
          result?: Json
          slug?: string
          solution?: Json
          sort_order?: number
          summary?: Json
          title?: Json
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member"],
    },
  },
} as const
