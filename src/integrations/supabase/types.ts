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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_feedback: {
        Row: {
          action_taken: string
          created_at: string
          feature: string
          id: string
          notes: string | null
          rating: number | null
          recommendation_id: string | null
          user_id: string
        }
        Insert: {
          action_taken?: string
          created_at?: string
          feature: string
          id?: string
          notes?: string | null
          rating?: number | null
          recommendation_id?: string | null
          user_id: string
        }
        Update: {
          action_taken?: string
          created_at?: string
          feature?: string
          id?: string
          notes?: string | null
          rating?: number | null
          recommendation_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bom_analyses: {
        Row: {
          architecture: string | null
          components_json: Json
          confidence: number
          created_at: string
          id: string
          image_url: string | null
          product_category: string | null
          product_name: string
          user_id: string
        }
        Insert: {
          architecture?: string | null
          components_json?: Json
          confidence?: number
          created_at?: string
          id?: string
          image_url?: string | null
          product_category?: string | null
          product_name: string
          user_id: string
        }
        Update: {
          architecture?: string | null
          components_json?: Json
          confidence?: number
          created_at?: string
          id?: string
          image_url?: string | null
          product_category?: string | null
          product_name?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_kits: {
        Row: {
          aesthetic: string
          colors: Json
          created_at: string
          id: string
          logo_url: string | null
          target_audience: string
          tone_keywords: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          aesthetic?: string
          colors?: Json
          created_at?: string
          id?: string
          logo_url?: string | null
          target_audience?: string
          tone_keywords?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          aesthetic?: string
          colors?: Json
          created_at?: string
          id?: string
          logo_url?: string | null
          target_audience?: string
          tone_keywords?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      competitor_alerts: {
        Row: {
          alert_type: string
          competitor_name: string
          created_at: string
          id: string
          message: string | null
          new_price: number
          old_price: number | null
          product_id: string | null
          severity: string
          status: string
          user_id: string
        }
        Insert: {
          alert_type?: string
          competitor_name: string
          created_at?: string
          id?: string
          message?: string | null
          new_price: number
          old_price?: number | null
          product_id?: string | null
          severity?: string
          status?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          competitor_name?: string
          created_at?: string
          id?: string
          message?: string | null
          new_price?: number
          old_price?: number | null
          product_id?: string | null
          severity?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_interactions: {
        Row: {
          competitor_name: string
          confidence_score: number | null
          created_at: string
          id: string
          message_sent: string | null
          platform: string
          product_id: string | null
          responded_at: string | null
          response_price: number | null
          response_received: string | null
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          competitor_name: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          message_sent?: string | null
          platform?: string
          product_id?: string | null
          responded_at?: string | null
          response_price?: number | null
          response_received?: string | null
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          competitor_name?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          message_sent?: string | null
          platform?: string
          product_id?: string | null
          responded_at?: string | null
          response_price?: number | null
          response_received?: string | null
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_interactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_prices: {
        Row: {
          collected_at: string
          competitor_name: string
          competitor_platform: string
          created_at: string
          currency: string
          id: string
          location: string | null
          price: number
          product_id: string | null
          source: string
          stock_status: string
          user_id: string
        }
        Insert: {
          collected_at?: string
          competitor_name: string
          competitor_platform?: string
          created_at?: string
          currency?: string
          id?: string
          location?: string | null
          price: number
          product_id?: string | null
          source?: string
          stock_status?: string
          user_id: string
        }
        Update: {
          collected_at?: string
          competitor_name?: string
          competitor_platform?: string
          created_at?: string
          currency?: string
          id?: string
          location?: string | null
          price?: number
          product_id?: string | null
          source?: string
          stock_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      content_orders: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          product_name: string
          quantity: number
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          product_name: string
          quantity?: number
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          product_name?: string
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      content_templates: {
        Row: {
          content_json: Json
          created_at: string
          id: string
          name: string
          product_name: string
          target_audience: string
          tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_json?: Json
          created_at?: string
          id?: string
          name: string
          product_name: string
          target_audience?: string
          tone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_json?: Json
          created_at?: string
          id?: string
          name?: string
          product_name?: string
          target_audience?: string
          tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          created_at: string
          id: string
          metrics_json: Json
          recommendations_json: Json
          report_date: string
          summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics_json?: Json
          recommendations_json?: Json
          report_date?: string
          summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics_json?: Json
          recommendations_json?: Json
          report_date?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      generated_pro_images: {
        Row: {
          created_at: string
          id: string
          image_key: string
          image_url: string
          label: string
          product_name: string
          prompt: string
          section: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_key: string
          image_url: string
          label: string
          product_name?: string
          prompt?: string
          section: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_key?: string
          image_url?: string
          label?: string
          product_name?: string
          prompt?: string
          section?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gtm_plans: {
        Row: {
          created_at: string
          id: string
          plan_json: Json
          product_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_json?: Json
          product_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_json?: Json
          product_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      landing_page_themes: {
        Row: {
          created_at: string
          id: string
          name: string
          theme_json: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          theme_json?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          theme_json?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_automation_rules: {
        Row: {
          config_json: Json
          created_at: string
          id: string
          is_active: boolean
          rule_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config_json?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          rule_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config_json?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          rule_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_connections: {
        Row: {
          connection_status: string
          created_at: string
          credentials_json: Json
          id: string
          last_sync_at: string | null
          listings_count: number
          platform_config_json: Json
          platform_name: string
          platform_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_status?: string
          created_at?: string
          credentials_json?: Json
          id?: string
          last_sync_at?: string | null
          listings_count?: number
          platform_config_json?: Json
          platform_name: string
          platform_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_status?: string
          created_at?: string
          credentials_json?: Json
          id?: string
          last_sync_at?: string | null
          listings_count?: number
          platform_config_json?: Json
          platform_name?: string
          platform_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          barcode: string | null
          category: string | null
          compare_at_price: number | null
          condition: string
          created_at: string
          currency: string
          description: string | null
          free_shipping: boolean
          id: string
          images_json: Json
          location: string | null
          low_stock_threshold: number
          price: number
          schedule_at: string | null
          shipping_cost: number | null
          shipping_dimensions: string | null
          shipping_weight: number | null
          sku: string | null
          status: string
          stock_quantity: number
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          variants_json: Json
          video_url: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          compare_at_price?: number | null
          condition?: string
          created_at?: string
          currency?: string
          description?: string | null
          free_shipping?: boolean
          id?: string
          images_json?: Json
          location?: string | null
          low_stock_threshold?: number
          price?: number
          schedule_at?: string | null
          shipping_cost?: number | null
          shipping_dimensions?: string | null
          shipping_weight?: number | null
          sku?: string | null
          status?: string
          stock_quantity?: number
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          variants_json?: Json
          video_url?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          compare_at_price?: number | null
          condition?: string
          created_at?: string
          currency?: string
          description?: string | null
          free_shipping?: boolean
          id?: string
          images_json?: Json
          location?: string | null
          low_stock_threshold?: number
          price?: number
          schedule_at?: string | null
          shipping_cost?: number | null
          shipping_dimensions?: string | null
          shipping_weight?: number | null
          sku?: string | null
          status?: string
          stock_quantity?: number
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          variants_json?: Json
          video_url?: string | null
        }
        Relationships: []
      }
      marketplace_messages: {
        Row: {
          created_at: string
          customer_avatar: string | null
          customer_name: string | null
          id: string
          is_archived: boolean
          is_read: boolean
          is_starred: boolean
          label: string | null
          listing_id: string | null
          message_text: string
          platform_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_avatar?: string | null
          customer_name?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          is_starred?: boolean
          label?: string | null
          listing_id?: string | null
          message_text: string
          platform_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_avatar?: string | null
          customer_name?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          is_starred?: boolean
          label?: string | null
          listing_id?: string | null
          message_text?: string
          platform_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_published: {
        Row: {
          clicks: number
          created_at: string
          expires_at: string | null
          external_id: string | null
          external_url: string | null
          id: string
          inquiries: number
          listing_id: string
          platform_name: string
          platform_overrides_json: Json
          published_at: string | null
          revenue: number
          status: string
          user_id: string
          views: number
        }
        Insert: {
          clicks?: number
          created_at?: string
          expires_at?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          inquiries?: number
          listing_id: string
          platform_name: string
          platform_overrides_json?: Json
          published_at?: string | null
          revenue?: number
          status?: string
          user_id: string
          views?: number
        }
        Update: {
          clicks?: number
          created_at?: string
          expires_at?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          inquiries?: number
          listing_id?: string
          platform_name?: string
          platform_overrides_json?: Json
          published_at?: string | null
          revenue?: number
          status?: string
          user_id?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_published_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_configs: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          interval_hours: number
          price_drop_threshold: number
          price_rise_threshold: number
          product_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          interval_hours?: number
          price_drop_threshold?: number
          price_rise_threshold?: number
          product_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          interval_hours?: number
          price_drop_threshold?: number
          price_rise_threshold?: number
          product_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_configs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_automation_rules: {
        Row: {
          channel: string
          created_at: string
          enabled: boolean
          id: string
          interval_hours: number
          max_runs: number
          product_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          enabled?: boolean
          id?: string
          interval_hours?: number
          max_runs?: number
          product_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          enabled?: boolean
          id?: string
          interval_hours?: number
          max_runs?: number
          product_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outreach_campaigns: {
        Row: {
          auto_repeat: boolean
          channel: string
          created_at: string
          id: string
          last_sent_at: string | null
          max_auto_runs: number
          message: string | null
          objective: string | null
          product_name: string | null
          repeat_interval_hours: number
          responded_at: string | null
          response_channel: string | null
          response_received: string | null
          runs_completed: number
          scheduled_day: number
          sequence_step: number
          status: string
          subject: string | null
          supplier_id: string
          supplier_name: string
          supplier_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_repeat?: boolean
          channel?: string
          created_at?: string
          id?: string
          last_sent_at?: string | null
          max_auto_runs?: number
          message?: string | null
          objective?: string | null
          product_name?: string | null
          repeat_interval_hours?: number
          responded_at?: string | null
          response_channel?: string | null
          response_received?: string | null
          runs_completed?: number
          scheduled_day?: number
          sequence_step?: number
          status?: string
          subject?: string | null
          supplier_id: string
          supplier_name: string
          supplier_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_repeat?: boolean
          channel?: string
          created_at?: string
          id?: string
          last_sent_at?: string | null
          max_auto_runs?: number
          message?: string | null
          objective?: string | null
          product_name?: string | null
          repeat_interval_hours?: number
          responded_at?: string | null
          response_channel?: string | null
          response_received?: string | null
          runs_completed?: number
          scheduled_day?: number
          sequence_step?: number
          status?: string
          subject?: string | null
          supplier_id?: string
          supplier_name?: string
          supplier_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outreach_configs: {
        Row: {
          created_at: string
          enabled: boolean
          frequency_hours: number
          id: string
          last_run_at: string | null
          last_run_results: Json | null
          max_contacts_per_run: number
          message_template: string | null
          product_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          frequency_hours?: number
          id?: string
          last_run_at?: string | null
          last_run_results?: Json | null
          max_contacts_per_run?: number
          message_template?: string | null
          product_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          frequency_hours?: number
          id?: string
          last_run_at?: string | null
          last_run_results?: Json | null
          max_contacts_per_run?: number
          message_template?: string | null
          product_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_configs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      post_engagement: {
        Row: {
          clicks: number
          comments: number
          created_at: string
          engagement_rate: number
          id: string
          impressions: number
          likes: number
          platform: string
          post_id: string
          reach: number
          recorded_at: string
          shares: number
          updated_at: string
          user_id: string
        }
        Insert: {
          clicks?: number
          comments?: number
          created_at?: string
          engagement_rate?: number
          id?: string
          impressions?: number
          likes?: number
          platform: string
          post_id: string
          reach?: number
          recorded_at?: string
          shares?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          clicks?: number
          comments?: number
          created_at?: string
          engagement_rate?: number
          id?: string
          impressions?: number
          likes?: number
          platform?: string
          post_id?: string
          reach?: number
          recorded_at?: string
          shares?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_engagement_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      price_changes: {
        Row: {
          ai_validation: Json | null
          created_at: string
          id: string
          new_price: number
          old_price: number
          product_id: string | null
          reason: string | null
          strategy_used: string
          user_id: string
        }
        Insert: {
          ai_validation?: Json | null
          created_at?: string
          id?: string
          new_price: number
          old_price: number
          product_id?: string | null
          reason?: string | null
          strategy_used?: string
          user_id: string
        }
        Update: {
          ai_validation?: Json | null
          created_at?: string
          id?: string
          new_price?: number
          old_price?: number
          product_id?: string | null
          reason?: string | null
          strategy_used?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_changes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_knowledge: {
        Row: {
          content_summary: string
          created_at: string
          id: string
          metadata_json: Json
          source_id: string | null
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_summary?: string
          created_at?: string
          id?: string
          metadata_json?: Json
          source_id?: string | null
          tags?: string[]
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_summary?: string
          created_at?: string
          id?: string
          metadata_json?: Json
          source_id?: string | null
          tags?: string[]
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          cost: number
          created_at: string
          current_price: number
          description: string | null
          id: string
          image_url: string | null
          name: string
          sku: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost?: number
          created_at?: string
          current_price?: number
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          sku?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost?: number
          created_at?: string
          current_price?: number
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sku?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_performance: {
        Row: {
          created_at: string
          date: string
          id: string
          product_id: string | null
          revenue: number
          units_sold: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          product_id?: string | null
          revenue?: number
          units_sold?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          product_id?: string | null
          revenue?: number
          units_sold?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_performance_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          batch_id: string | null
          content: string
          created_at: string
          engagement_rate: number
          id: string
          platforms: string[]
          scheduled_at: string | null
          status: string
          total_clicks: number
          total_comments: number
          total_impressions: number
          total_likes: number
          total_shares: number
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          content: string
          created_at?: string
          engagement_rate?: number
          id?: string
          platforms: string[]
          scheduled_at?: string | null
          status?: string
          total_clicks?: number
          total_comments?: number
          total_impressions?: number
          total_likes?: number
          total_shares?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_id?: string | null
          content?: string
          created_at?: string
          engagement_rate?: number
          id?: string
          platforms?: string[]
          scheduled_at?: string | null
          status?: string
          total_clicks?: number
          total_comments?: number
          total_impressions?: number
          total_likes?: number
          total_shares?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_social_credentials: {
        Row: {
          created_at: string
          credentials: Json
          id: string
          is_connected: boolean
          platform: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          credentials?: Json
          id?: string
          is_connected?: boolean
          platform: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          credentials?: Json
          id?: string
          is_connected?: boolean
          platform?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      websites: {
        Row: {
          config_json: Json
          created_at: string
          id: string
          is_published: boolean
          name: string
          published_html: string | null
          slug: string
          theme_json: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          config_json?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          published_html?: string | null
          slug: string
          theme_json?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          config_json?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          published_html?: string | null
          slug?: string
          theme_json?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_ai_results: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          recommendations_json: Json
          status: string
          suggested_actions_json: Json
          summary: string
          task_id: string
          task_name: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          recommendations_json?: Json
          status?: string
          suggested_actions_json?: Json
          summary: string
          task_id: string
          task_name: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          recommendations_json?: Json
          status?: string
          suggested_actions_json?: Json
          summary?: string
          task_id?: string
          task_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
