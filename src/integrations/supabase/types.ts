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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      ai_agents: {
        Row: {
          description: string
          domains: string[]
          id: string
          is_enabled: boolean
          model: string
          name: string
          slug: string
          sort_order: number
          system_prompt: string
          updated_at: string
        }
        Insert: {
          description?: string
          domains?: string[]
          id?: string
          is_enabled?: boolean
          model?: string
          name: string
          slug: string
          sort_order?: number
          system_prompt?: string
          updated_at?: string
        }
        Update: {
          description?: string
          domains?: string[]
          id?: string
          is_enabled?: boolean
          model?: string
          name?: string
          slug?: string
          sort_order?: number
          system_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          agent_slug: string
          category: string | null
          classification: string | null
          collected: Json
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          escalated: boolean
          escalation_reason: string | null
          id: string
          inquiry_id: string | null
          lead_score: number | null
          message_count: number
          risk_flags: string[]
          status: string
          summary: Json
          updated_at: string
          user_id: string | null
          visitor_id: string | null
        }
        Insert: {
          agent_slug?: string
          category?: string | null
          classification?: string | null
          collected?: Json
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          escalated?: boolean
          escalation_reason?: string | null
          id?: string
          inquiry_id?: string | null
          lead_score?: number | null
          message_count?: number
          risk_flags?: string[]
          status?: string
          summary?: Json
          updated_at?: string
          user_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          agent_slug?: string
          category?: string | null
          classification?: string | null
          collected?: Json
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          escalated?: boolean
          escalation_reason?: string | null
          id?: string
          inquiry_id?: string | null
          lead_score?: number | null
          message_count?: number
          risk_flags?: string[]
          status?: string
          summary?: Json
          updated_at?: string
          user_id?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          agent_slug: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          agent_slug?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          agent_slug?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_packages: {
        Row: {
          billing_interval: string
          code: string
          currency: string
          description: string
          features: Json
          id: string
          is_active: boolean
          monthly_price: number
          name: string
          paystack_plan_code: string | null
          product_type: string
          setup_fee: number
          sort_order: number
          trial_days: number
          updated_at: string
          usage_limit: number
        }
        Insert: {
          billing_interval?: string
          code: string
          currency?: string
          description?: string
          features?: Json
          id?: string
          is_active?: boolean
          monthly_price?: number
          name: string
          paystack_plan_code?: string | null
          product_type?: string
          setup_fee?: number
          sort_order?: number
          trial_days?: number
          updated_at?: string
          usage_limit?: number
        }
        Update: {
          billing_interval?: string
          code?: string
          currency?: string
          description?: string
          features?: Json
          id?: string
          is_active?: boolean
          monthly_price?: number
          name?: string
          paystack_plan_code?: string | null
          product_type?: string
          setup_fee?: number
          sort_order?: number
          trial_days?: number
          updated_at?: string
          usage_limit?: number
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          ai_enabled: boolean
          allowed_services: string[]
          base_instructions: string
          business_hours: string
          cold_threshold: number
          escalation_rules: string
          hot_threshold: number
          id: boolean
          scoring_rules: Json
          show_score_to_user: boolean
          tone: string
          updated_at: string
          warm_threshold: number
        }
        Insert: {
          ai_enabled?: boolean
          allowed_services?: string[]
          base_instructions?: string
          business_hours?: string
          cold_threshold?: number
          escalation_rules?: string
          hot_threshold?: number
          id?: boolean
          scoring_rules?: Json
          show_score_to_user?: boolean
          tone?: string
          updated_at?: string
          warm_threshold?: number
        }
        Update: {
          ai_enabled?: boolean
          allowed_services?: string[]
          base_instructions?: string
          business_hours?: string
          cold_threshold?: number
          escalation_rules?: string
          hot_threshold?: number
          id?: boolean
          scoring_rules?: Json
          show_score_to_user?: boolean
          tone?: string
          updated_at?: string
          warm_threshold?: number
        }
        Relationships: []
      }
      ai_unknown_questions: {
        Row: {
          category: string | null
          conversation_id: string | null
          created_at: string
          id: string
          question: string
          resolved: boolean
          times_asked: number
        }
        Insert: {
          category?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          question: string
          resolved?: boolean
          times_asked?: number
        }
        Update: {
          category?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          question?: string
          resolved?: boolean
          times_asked?: number
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          after_value: Json | null
          before_value: Json | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      callback_requests: {
        Row: {
          contact_method: string | null
          contact_value: string | null
          conversation_id: string | null
          created_at: string
          full_name: string | null
          id: string
          inquiry_id: string | null
          preferred_date: string | null
          preferred_time: string | null
          reason: string | null
          status: string
          timezone: string | null
        }
        Insert: {
          contact_method?: string | null
          contact_value?: string | null
          conversation_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          inquiry_id?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          reason?: string | null
          status?: string
          timezone?: string | null
        }
        Update: {
          contact_method?: string | null
          contact_value?: string | null
          conversation_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          inquiry_id?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          reason?: string | null
          status?: string
          timezone?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string
          id: string
          industry: string
          is_active: boolean
          link: string | null
          logo_url: string | null
          name: string
          slug: string
          socials: Json
          sort_order: number
          status: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description: string
          id?: string
          industry: string
          is_active?: boolean
          link?: string | null
          logo_url?: string | null
          name: string
          slug: string
          socials?: Json
          sort_order?: number
          status?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          industry?: string
          is_active?: boolean
          link?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          socials?: Json
          sort_order?: number
          status?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          routing_keywords: string[]
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          routing_keywords?: string[]
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          routing_keywords?: string[]
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          id: string
          inquiry_id: string | null
          kind: string
          name: string
          owner_id: string | null
          path: string
          project_id: string | null
          size_bytes: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          inquiry_id?: string | null
          kind?: string
          name: string
          owner_id?: string | null
          path: string
          project_id?: string | null
          size_bytes?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          inquiry_id?: string | null
          kind?: string
          name?: string
          owner_id?: string | null
          path?: string
          project_id?: string | null
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          ai_summary: string | null
          assigned_to: string | null
          budget: string | null
          category: string | null
          company: string | null
          contact_method: string | null
          country: string | null
          created_at: string
          description: string
          details: Json
          email: string
          estimated_value: number | null
          follow_up_date: string | null
          full_name: string
          id: string
          kind: string
          last_contact: string | null
          lead_quality: string | null
          next_action: string | null
          phone: string | null
          priority: string | null
          reference: string
          service: string | null
          source: string | null
          status: string
          timeline: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_summary?: string | null
          assigned_to?: string | null
          budget?: string | null
          category?: string | null
          company?: string | null
          contact_method?: string | null
          country?: string | null
          created_at?: string
          description: string
          details?: Json
          email: string
          estimated_value?: number | null
          follow_up_date?: string | null
          full_name: string
          id?: string
          kind?: string
          last_contact?: string | null
          lead_quality?: string | null
          next_action?: string | null
          phone?: string | null
          priority?: string | null
          reference: string
          service?: string | null
          source?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_summary?: string | null
          assigned_to?: string | null
          budget?: string | null
          category?: string | null
          company?: string | null
          contact_method?: string | null
          country?: string | null
          created_at?: string
          description?: string
          details?: Json
          email?: string
          estimated_value?: number | null
          follow_up_date?: string | null
          full_name?: string
          id?: string
          kind?: string
          last_contact?: string | null
          lead_quality?: string | null
          next_action?: string | null
          phone?: string | null
          priority?: string | null
          reference?: string
          service?: string | null
          source?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inquiry_notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          inquiry_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          inquiry_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          inquiry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_notes_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          number: string
          paid_at: string | null
          proposal_id: string | null
          status: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          number: string
          paid_at?: string | null
          proposal_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          number?: string
          paid_at?: string | null
          proposal_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_confidential: boolean
          is_verified: boolean
          metadata: Json
          reference_code: string | null
          tags: string[]
          title: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_confidential?: boolean
          is_verified?: boolean
          metadata?: Json
          reference_code?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_confidential?: boolean
          is_verified?: boolean
          metadata?: Json
          reference_code?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          category: string
          content_type: string | null
          created_at: string
          id: string
          name: string
          path: string
          size_bytes: number | null
          uploaded_by: string | null
          url: string
          usage_note: string | null
        }
        Insert: {
          category?: string
          content_type?: string | null
          created_at?: string
          id?: string
          name: string
          path: string
          size_bytes?: number | null
          uploaded_by?: string | null
          url: string
          usage_note?: string | null
        }
        Update: {
          category?: string
          content_type?: string | null
          created_at?: string
          id?: string
          name?: string
          path?: string
          size_bytes?: number | null
          uploaded_by?: string | null
          url?: string
          usage_note?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          from_admin: boolean
          id: string
          read_at: string | null
          sender_id: string
          thread_user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          from_admin?: boolean
          id?: string
          read_at?: string | null
          sender_id: string
          thread_user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          from_admin?: boolean
          id?: string
          read_at?: string | null
          sender_id?: string
          thread_user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          kind: string
          read_at: string | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      project_milestones: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          is_complete: boolean
          project_id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_complete?: boolean
          project_id: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_complete?: boolean
          project_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string
          deadline: string | null
          id: string
          inquiry_id: string | null
          is_archived: boolean
          kind: string
          notes: string | null
          platform: string | null
          progress: number
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          inquiry_id?: string | null
          is_archived?: boolean
          kind?: string
          notes?: string | null
          platform?: string | null
          progress?: number
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          inquiry_id?: string | null
          is_archived?: boolean
          kind?: string
          notes?: string | null
          platform?: string | null
          progress?: number
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          amount: number | null
          client_id: string | null
          created_at: string
          currency: string
          id: string
          inquiry_id: string | null
          items: Json
          scope: string | null
          status: string
          terms: string | null
          timeline: string | null
          title: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          inquiry_id?: string | null
          items?: Json
          scope?: string | null
          status?: string
          terms?: string | null
          timeline?: string | null
          title: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          inquiry_id?: string | null
          items?: Json
          scope?: string | null
          status?: string
          terms?: string | null
          timeline?: string | null
          title?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string
          cta: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          pricing_info: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          category: string
          created_at?: string
          cta?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          pricing_info?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string
          cta?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          pricing_info?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          created_at: string
          device: string | null
          id: string
          path: string
          referrer: string | null
          user_id: string | null
          visitor_key: string | null
        }
        Insert: {
          created_at?: string
          device?: string | null
          id?: string
          path: string
          referrer?: string | null
          user_id?: string | null
          visitor_key?: string | null
        }
        Update: {
          created_at?: string
          device?: string | null
          id?: string
          path?: string
          referrer?: string | null
          user_id?: string | null
          visitor_key?: string | null
        }
        Relationships: []
      }
      staff_assignments: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          id: string
          paystack_customer_code: string | null
          paystack_plan_code: string | null
          paystack_subscription_code: string | null
          plan_id: string | null
          started_at: string
          status: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          paystack_customer_code?: string | null
          paystack_plan_code?: string | null
          paystack_subscription_code?: string | null
          plan_id?: string | null
          started_at?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          paystack_customer_code?: string | null
          paystack_plan_code?: string | null
          paystack_subscription_code?: string | null
          plan_id?: string | null
          started_at?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "ai_packages"
            referencedColumns: ["id"]
          },
        ]
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
      app_role:
        | "admin"
        | "user"
        | "super_admin"
        | "sales"
        | "project_manager"
        | "content_manager"
        | "analyst"
        | "support"
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
      app_role: [
        "admin",
        "user",
        "super_admin",
        "sales",
        "project_manager",
        "content_manager",
        "analyst",
        "support",
      ],
    },
  },
} as const
