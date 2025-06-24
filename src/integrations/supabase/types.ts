export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      family_members: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          role: string | null
          tree_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          role?: string | null
          tree_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          role?: string | null
          tree_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "family_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      family_relations: {
        Row: {
          created_at: string | null
          id: string
          related_to: string | null
          relation_type: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          related_to?: string | null
          relation_type: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          related_to?: string | null
          relation_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      family_trees: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: never
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: never
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_trees_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      join_requests: {
        Row: {
          created_at: string | null
          id: string
          requester_id: string | null
          status: string | null
          tree_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
          tree_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
          tree_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_requests_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "family_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_admin_message: boolean | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_admin_message?: boolean | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_admin_message?: boolean | null
          sender_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          birth_place: string | null
          country: string | null
          created_at: string
          current_location: string | null
          email: string
          father_id: string | null
          first_name: string
          id: string
          is_admin: boolean | null
          is_blocked: boolean | null
          is_patriarch: boolean | null
          last_name: string
          mother_id: string | null
          phone: string | null
          photo_url: string | null
          relationship_type:
            | Database["public"]["Enums"]["relationship_type"]
            | null
          role: string | null
          situation: string | null
          civilite: Database["public"]["Enums"]["family_title"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          birth_place?: string | null
          country?: string | null
          created_at?: string
          current_location?: string | null
          email: string
          father_id?: string | null
          first_name: string
          id: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          is_patriarch?: boolean | null
          last_name: string
          mother_id?: string | null
          phone?: string | null
          photo_url?: string | null
          relationship_type?:
            | Database["public"]["Enums"]["relationship_type"]
            | null
          role?: string | null
          situation?: string | null
          civilite?: Database["public"]["Enums"]["family_title"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          birth_place?: string | null
          country?: string | null
          created_at?: string
          current_location?: string | null
          email?: string
          father_id?: string | null
          first_name?: string
          id?: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          is_patriarch?: boolean | null
          last_name?: string
          mother_id?: string | null
          phone?: string | null
          photo_url?: string | null
          relationship_type?:
            | Database["public"]["Enums"]["relationship_type"]
            | null
          role?: string | null
          situation?: string | null
          civilite?: Database["public"]["Enums"]["family_title"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_father_id_fkey"
            columns: ["father_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          created_at: string | null
          id: string
          person1_id: string | null
          person2_id: string | null
          relationship_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          person1_id?: string | null
          person2_id?: string | null
          relationship_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          person1_id?: string | null
          person2_id?: string | null
          relationship_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationships_person1_id_fkey"
            columns: ["person1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_person2_id_fkey"
            columns: ["person2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          family_tree_title: string
          id: number
          members_page_title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          family_tree_title?: string
          id?: number
          members_page_title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          family_tree_title?: string
          id?: number
          members_page_title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_all_data: {
        Args: Record<PropertyKey, never> | { auth_code: string }
        Returns: undefined
      }
      is_first_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      manage_profile: {
        Args: {
          p_id: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_role: string
          p_country: string
          p_phone: string
          p_photo_url: string
          p_birth_date: string
          p_birth_place: string
          p_title: string
          p_is_patriarch: boolean
          p_is_admin: boolean
          p_operation: string
        }
        Returns: undefined
      }
    }
    Enums: {
      family_title:
        | "Patriarche"
        | "Matriarche"
        | "Père"
        | "Mère"
        | "Fils"
        | "Fille"
        | "Grand-père"
        | "Grand-mère"
        | "Petit-fils"
        | "Petite-fille"
        | "Oncle"
        | "Tante"
        | "Neveu"
        | "Nièce"
        | "Cousin"
        | "Cousine"
        | "Époux"
        | "Épouse"
        | "Beau-père"
        | "Belle-mère"
        | "Beau-fils"
        | "Belle-fille"
        | "Frère"
        | "Sœur"
      relationship_type:
        | "fils"
        | "fille"
        | "père"
        | "mère"
        | "cousin"
        | "cousine"
        | "tante"
        | "oncle"
        | "neveu"
        | "nièce"
        | "petit-fils"
        | "petite-fille"
        | "grand-père"
        | "grande-mère"
        | "époux"
        | "épouse"
        | "patriarche"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      family_title: [
        "Patriarche",
        "Matriarche",
        "Père",
        "Mère",
        "Fils",
        "Fille",
        "Grand-père",
        "Grand-mère",
        "Petit-fils",
        "Petite-fille",
        "Oncle",
        "Tante",
        "Neveu",
        "Nièce",
        "Cousin",
        "Cousine",
        "Époux",
        "Épouse",
        "Beau-père",
        "Belle-mère",
        "Beau-fils",
        "Belle-fille",
        "Frère",
        "Sœur",
      ],
      relationship_type: [
        "fils",
        "fille",
        "père",
        "mère",
        "cousin",
        "cousine",
        "tante",
        "oncle",
        "neveu",
        "nièce",
        "petit-fils",
        "petite-fille",
        "grand-père",
        "grande-mère",
        "époux",
        "épouse",
        "patriarche",
      ],
    },
  },
} as const
