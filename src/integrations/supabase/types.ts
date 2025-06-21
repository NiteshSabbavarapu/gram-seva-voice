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
      complaint_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          complaint_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          complaint_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          complaint_id?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_assignments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_comments: {
        Row: {
          comment: string
          complaint_id: string | null
          created_at: string | null
          id: string
          internal: boolean
          user_id: string | null
        }
        Insert: {
          comment: string
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          internal?: boolean
          user_id?: string | null
        }
        Update: {
          comment?: string
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          internal?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_comments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_notifications: {
        Row: {
          complaint_id: string | null
          created_at: string | null
          id: string
          read: boolean
          recipient_user_id: string | null
          type: string
        }
        Insert: {
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          read?: boolean
          recipient_user_id?: string | null
          type: string
        }
        Update: {
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          read?: boolean
          recipient_user_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_notifications_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          area_type: string | null
          assigned_officer_id: string | null
          category: string | null
          citizen_id: string | null
          description: string
          forwarded_to: string | null
          id: string
          location_id: string | null
          location_name: string | null
          name: string | null
          phone: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          submitted_at: string | null
          voice_duration: number | null
          voice_message: string | null
        }
        Insert: {
          area_type?: string | null
          assigned_officer_id?: string | null
          category?: string | null
          citizen_id?: string | null
          description: string
          forwarded_to?: string | null
          id?: string
          location_id?: string | null
          location_name?: string | null
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          submitted_at?: string | null
          voice_duration?: number | null
          voice_message?: string | null
        }
        Update: {
          area_type?: string | null
          assigned_officer_id?: string | null
          category?: string | null
          citizen_id?: string | null
          description?: string
          forwarded_to?: string | null
          id?: string
          location_id?: string | null
          location_name?: string | null
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          submitted_at?: string | null
          voice_duration?: number | null
          voice_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_officer_id_fkey"
            columns: ["assigned_officer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_assignments: {
        Row: {
          id: string
          location_id: string
          user_id: string
        }
        Insert: {
          id?: string
          location_id: string
          user_id: string
        }
        Update: {
          id?: string
          location_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_assignments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      location_contacts: {
        Row: {
          contact_name: string
          id: string
          location_id: string | null
          phone: string
        }
        Insert: {
          contact_name: string
          id?: string
          location_id?: string | null
          phone: string
        }
        Update: {
          contact_name?: string
          id?: string
          location_id?: string | null
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_contacts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          id: string
          name: string
          type: Database["public"]["Enums"]["location_type"]
        }
        Insert: {
          id?: string
          name: string
          type: Database["public"]["Enums"]["location_type"]
        }
        Update: {
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["location_type"]
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      },
      supervisor_feedback: {
        Row: {
          id: string;
          complaint_id: string;
          supervisor_id: string;
          rating: number;
          comments: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          supervisor_id: string;
          rating: number;
          comments?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          complaint_id?: string;
          supervisor_id?: string;
          rating?: number;
          comments?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supervisor_feedback_complaint_id_fkey",
            columns: ["complaint_id"],
            isOneToOne: false,
            referencedRelation: "complaints",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_feedback_supervisor_id_fkey",
            columns: ["supervisor_id"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ];
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      complaint_status: "submitted" | "in_progress" | "resolved"
      location_type: "village" | "city"
      user_role: "citizen" | "employee" | "admin"
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
      complaint_status: ["submitted", "in_progress", "resolved"],
      location_type: ["village", "city"],
      user_role: ["citizen", "employee", "admin"],
    },
  },
} as const
