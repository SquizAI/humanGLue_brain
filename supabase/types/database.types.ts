/**
 * Database TypeScript Type Definitions
 * Generated from HumanGlue Supabase Schema
 *
 * These types provide complete type safety for database operations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          company_name: string | null
          job_title: string | null
          metadata: Json
          status: 'active' | 'inactive' | 'suspended'
          email_verified: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          company_name?: string | null
          job_title?: string | null
          metadata?: Json
          status?: 'active' | 'inactive' | 'suspended'
          email_verified?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          company_name?: string | null
          job_title?: string | null
          metadata?: Json
          status?: 'active' | 'inactive' | 'suspended'
          email_verified?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'instructor' | 'expert' | 'client' | 'user'
          organization_id: string | null
          metadata: Json
          granted_by: string | null
          granted_at: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'instructor' | 'expert' | 'client' | 'user'
          organization_id?: string | null
          metadata?: Json
          granted_by?: string | null
          granted_at?: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'instructor' | 'expert' | 'client' | 'user'
          organization_id?: string | null
          metadata?: Json
          granted_by?: string | null
          granted_at?: string
          expires_at?: string | null
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          website: string | null
          industry: string | null
          company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+' | null
          subscription_tier: 'starter' | 'growth' | 'enterprise'
          subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused'
          settings: Json
          primary_contact_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          website?: string | null
          industry?: string | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+' | null
          subscription_tier?: 'starter' | 'growth' | 'enterprise'
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused'
          settings?: Json
          primary_contact_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          website?: string | null
          industry?: string | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+' | null
          subscription_tier?: 'starter' | 'growth' | 'enterprise'
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused'
          settings?: Json
          primary_contact_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workshops: {
        Row: {
          id: string
          title: string
          description: string
          slug: string
          instructor_id: string
          pillar: 'adaptability' | 'coaching' | 'marketplace'
          level: 'beginner' | 'intermediate' | 'advanced'
          format: 'live' | 'hybrid' | 'recorded'
          schedule_date: string | null
          schedule_time: string | null
          duration_minutes: number
          timezone: string
          capacity_total: number
          capacity_remaining: number
          price_amount: number
          price_early_bird: number | null
          price_currency: string
          outcomes: string[]
          tags: string[]
          syllabus: Json
          thumbnail_url: string | null
          video_url: string | null
          status: 'draft' | 'published' | 'archived' | 'cancelled'
          is_featured: boolean
          metadata: Json
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          slug: string
          instructor_id: string
          pillar: 'adaptability' | 'coaching' | 'marketplace'
          level: 'beginner' | 'intermediate' | 'advanced'
          format: 'live' | 'hybrid' | 'recorded'
          schedule_date?: string | null
          schedule_time?: string | null
          duration_minutes: number
          timezone?: string
          capacity_total: number
          capacity_remaining: number
          price_amount: number
          price_early_bird?: number | null
          price_currency?: string
          outcomes?: string[]
          tags?: string[]
          syllabus?: Json
          thumbnail_url?: string | null
          video_url?: string | null
          status?: 'draft' | 'published' | 'archived' | 'cancelled'
          is_featured?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          slug?: string
          instructor_id?: string
          pillar?: 'adaptability' | 'coaching' | 'marketplace'
          level?: 'beginner' | 'intermediate' | 'advanced'
          format?: 'live' | 'hybrid' | 'recorded'
          schedule_date?: string | null
          schedule_time?: string | null
          duration_minutes?: number
          timezone?: string
          capacity_total?: number
          capacity_remaining?: number
          price_amount?: number
          price_early_bird?: number | null
          price_currency?: string
          outcomes?: string[]
          tags?: string[]
          syllabus?: Json
          thumbnail_url?: string | null
          video_url?: string | null
          status?: 'draft' | 'published' | 'archived' | 'cancelled'
          is_featured?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      workshop_registrations: {
        Row: {
          id: string
          workshop_id: string
          user_id: string
          status: 'registered' | 'completed' | 'cancelled' | 'no_show'
          price_paid: number
          payment_id: string | null
          attended: boolean
          attendance_percentage: number | null
          completed_at: string | null
          certificate_id: string | null
          rating: number | null
          review: string | null
          metadata: Json
          registered_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workshop_id: string
          user_id: string
          status?: 'registered' | 'completed' | 'cancelled' | 'no_show'
          price_paid: number
          payment_id?: string | null
          attended?: boolean
          attendance_percentage?: number | null
          completed_at?: string | null
          certificate_id?: string | null
          rating?: number | null
          review?: string | null
          metadata?: Json
          registered_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workshop_id?: string
          user_id?: string
          status?: 'registered' | 'completed' | 'cancelled' | 'no_show'
          price_paid?: number
          payment_id?: string | null
          attended?: boolean
          attendance_percentage?: number | null
          completed_at?: string | null
          certificate_id?: string | null
          rating?: number | null
          review?: string | null
          metadata?: Json
          registered_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          assessment_type: 'full' | 'quick' | 'follow_up'
          status: 'in_progress' | 'completed' | 'abandoned'
          individual_score: number | null
          leadership_score: number | null
          cultural_score: number | null
          embedding_score: number | null
          velocity_score: number | null
          overall_score: number | null
          results: Json
          recommendations: Json
          metadata: Json
          started_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          assessment_type?: 'full' | 'quick' | 'follow_up'
          status?: 'in_progress' | 'completed' | 'abandoned'
          individual_score?: number | null
          leadership_score?: number | null
          cultural_score?: number | null
          embedding_score?: number | null
          velocity_score?: number | null
          results?: Json
          recommendations?: Json
          metadata?: Json
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          assessment_type?: 'full' | 'quick' | 'follow_up'
          status?: 'in_progress' | 'completed' | 'abandoned'
          individual_score?: number | null
          leadership_score?: number | null
          cultural_score?: number | null
          embedding_score?: number | null
          velocity_score?: number | null
          results?: Json
          recommendations?: Json
          metadata?: Json
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assessment_answers: {
        Row: {
          id: string
          assessment_id: string
          question_id: string
          dimension: 'individual' | 'leadership' | 'cultural' | 'embedding' | 'velocity'
          answer_type: 'scale' | 'multiChoice' | 'fearToConfidence' | 'text'
          answer_value: number | null
          answer_text: string | null
          question_text: string
          question_weight: number
          answered_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          question_id: string
          dimension: 'individual' | 'leadership' | 'cultural' | 'embedding' | 'velocity'
          answer_type: 'scale' | 'multiChoice' | 'fearToConfidence' | 'text'
          answer_value?: number | null
          answer_text?: string | null
          question_text: string
          question_weight: number
          answered_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          question_id?: string
          dimension?: 'individual' | 'leadership' | 'cultural' | 'embedding' | 'velocity'
          answer_type?: 'scale' | 'multiChoice' | 'fearToConfidence' | 'text'
          answer_value?: number | null
          answer_text?: string | null
          question_text?: string
          question_weight?: number
          answered_at?: string
        }
      }
      talent_profiles: {
        Row: {
          id: string
          user_id: string
          tagline: string
          bio: string
          location: string | null
          expertise: string[]
          certifications: string[]
          languages: string[]
          transformation_success_rate: number | null
          behavior_change_score: number | null
          client_retention_rate: number | null
          cultures_transformed: number
          years_experience: number
          clients_transformed: number
          employees_reframed: number
          industries: string[]
          transformation_stages: string[]
          coaching_style: 'directive' | 'facilitative' | 'hybrid' | null
          rating: number
          review_count: number
          availability: 'available' | 'limited' | 'booked'
          hourly_rate: number
          min_engagement_hours: number | null
          max_hours_per_week: number | null
          avatar_url: string | null
          video_intro_url: string | null
          is_public: boolean
          accepting_clients: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tagline: string
          bio: string
          location?: string | null
          expertise?: string[]
          certifications?: string[]
          languages?: string[]
          transformation_success_rate?: number | null
          behavior_change_score?: number | null
          client_retention_rate?: number | null
          cultures_transformed?: number
          years_experience: number
          clients_transformed?: number
          employees_reframed?: number
          industries?: string[]
          transformation_stages?: string[]
          coaching_style?: 'directive' | 'facilitative' | 'hybrid' | null
          rating?: number
          review_count?: number
          availability?: 'available' | 'limited' | 'booked'
          hourly_rate: number
          min_engagement_hours?: number | null
          max_hours_per_week?: number | null
          avatar_url?: string | null
          video_intro_url?: string | null
          is_public?: boolean
          accepting_clients?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tagline?: string
          bio?: string
          location?: string | null
          expertise?: string[]
          certifications?: string[]
          languages?: string[]
          transformation_success_rate?: number | null
          behavior_change_score?: number | null
          client_retention_rate?: number | null
          cultures_transformed?: number
          years_experience?: number
          clients_transformed?: number
          employees_reframed?: number
          industries?: string[]
          transformation_stages?: string[]
          coaching_style?: 'directive' | 'facilitative' | 'hybrid' | null
          rating?: number
          review_count?: number
          availability?: 'available' | 'limited' | 'booked'
          hourly_rate?: number
          min_engagement_hours?: number | null
          max_hours_per_week?: number | null
          avatar_url?: string | null
          video_intro_url?: string | null
          is_public?: boolean
          accepting_clients?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      talent_testimonials: {
        Row: {
          id: string
          talent_profile_id: string
          client_name: string
          client_company: string
          client_title: string | null
          quote: string
          metric: string | null
          verified: boolean
          is_featured: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          talent_profile_id: string
          client_name: string
          client_company: string
          client_title?: string | null
          quote: string
          metric?: string | null
          verified?: boolean
          is_featured?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          talent_profile_id?: string
          client_name?: string
          client_company?: string
          client_title?: string | null
          quote?: string
          metric?: string | null
          verified?: boolean
          is_featured?: boolean
          display_order?: number
          created_at?: string
        }
      }
      engagements: {
        Row: {
          id: string
          client_id: string
          expert_id: string
          organization_id: string | null
          title: string
          description: string
          focus_area: string
          hours_total: number
          hours_used: number
          hourly_rate: number
          status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          estimated_completion_date: string | null
          deliverables: Json
          milestones: Json
          outcomes: Json
          client_satisfaction_score: number | null
          metadata: Json
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          expert_id: string
          organization_id?: string | null
          title: string
          description: string
          focus_area: string
          hours_total: number
          hours_used?: number
          hourly_rate: number
          status?: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          estimated_completion_date?: string | null
          deliverables?: Json
          milestones?: Json
          outcomes?: Json
          client_satisfaction_score?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          expert_id?: string
          organization_id?: string | null
          title?: string
          description?: string
          focus_area?: string
          hours_total?: number
          hours_used?: number
          hourly_rate?: number
          status?: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          estimated_completion_date?: string | null
          deliverables?: Json
          milestones?: Json
          outcomes?: Json
          client_satisfaction_score?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      engagement_sessions: {
        Row: {
          id: string
          engagement_id: string
          title: string
          description: string | null
          session_type: 'coaching' | 'workshop' | 'consultation' | 'follow_up' | null
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          duration_hours: number | null
          session_notes: string | null
          action_items: Json
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          engagement_id: string
          title: string
          description?: string | null
          session_type?: 'coaching' | 'workshop' | 'consultation' | 'follow_up' | null
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          duration_hours?: number | null
          session_notes?: string | null
          action_items?: Json
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          engagement_id?: string
          title?: string
          description?: string | null
          session_type?: 'coaching' | 'workshop' | 'consultation' | 'follow_up' | null
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          duration_hours?: number | null
          session_notes?: string | null
          action_items?: Json
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          amount: number
          currency: string
          payment_method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'stripe' | null
          transaction_id: string | null
          provider: 'stripe' | 'paypal' | 'manual'
          provider_customer_id: string | null
          status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled'
          payment_type: 'workshop' | 'engagement' | 'subscription' | 'other'
          related_entity_id: string | null
          invoice_number: string | null
          invoice_url: string | null
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          amount: number
          currency?: string
          payment_method?: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'stripe' | null
          transaction_id?: string | null
          provider: 'stripe' | 'paypal' | 'manual'
          provider_customer_id?: string | null
          status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled'
          payment_type: 'workshop' | 'engagement' | 'subscription' | 'other'
          related_entity_id?: string | null
          invoice_number?: string | null
          invoice_url?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          amount?: number
          currency?: string
          payment_method?: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'stripe' | null
          transaction_id?: string | null
          provider?: 'stripe' | 'paypal' | 'manual'
          provider_customer_id?: string | null
          status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled'
          payment_type?: 'workshop' | 'engagement' | 'subscription' | 'other'
          related_entity_id?: string | null
          invoice_number?: string | null
          invoice_url?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          processed_at?: string | null
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          certificate_type: 'workshop' | 'program' | 'assessment'
          title: string
          description: string | null
          workshop_id: string | null
          assessment_id: string | null
          certificate_number: string
          issue_date: string
          expiry_date: string | null
          skills_demonstrated: string[]
          competencies: Json
          certificate_url: string | null
          badge_url: string | null
          verification_url: string | null
          is_verified: boolean
          issued_by: string | null
          issuer_name: string
          issuer_title: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certificate_type: 'workshop' | 'program' | 'assessment'
          title: string
          description?: string | null
          workshop_id?: string | null
          assessment_id?: string | null
          certificate_number?: string
          issue_date?: string
          expiry_date?: string | null
          skills_demonstrated?: string[]
          competencies?: Json
          certificate_url?: string | null
          badge_url?: string | null
          verification_url?: string | null
          is_verified?: boolean
          issued_by?: string | null
          issuer_name: string
          issuer_title?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certificate_type?: 'workshop' | 'program' | 'assessment'
          title?: string
          description?: string | null
          workshop_id?: string | null
          assessment_id?: string | null
          certificate_number?: string
          issue_date?: string
          expiry_date?: string | null
          skills_demonstrated?: string[]
          competencies?: Json
          certificate_url?: string | null
          badge_url?: string | null
          verification_url?: string | null
          is_verified?: boolean
          issued_by?: string | null
          issuer_name?: string
          issuer_title?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          review_type: 'workshop' | 'expert' | 'engagement'
          workshop_id: string | null
          expert_id: string | null
          engagement_id: string | null
          rating: number
          title: string | null
          review_text: string
          content_quality_rating: number | null
          delivery_rating: number | null
          value_rating: number | null
          impact_rating: number | null
          verified_purchase: boolean
          status: 'pending' | 'approved' | 'rejected' | 'flagged'
          moderation_notes: string | null
          helpful_count: number
          not_helpful_count: number
          response_text: string | null
          response_by: string | null
          responded_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          review_type: 'workshop' | 'expert' | 'engagement'
          workshop_id?: string | null
          expert_id?: string | null
          engagement_id?: string | null
          rating: number
          title?: string | null
          review_text: string
          content_quality_rating?: number | null
          delivery_rating?: number | null
          value_rating?: number | null
          impact_rating?: number | null
          verified_purchase?: boolean
          status?: 'pending' | 'approved' | 'rejected' | 'flagged'
          moderation_notes?: string | null
          helpful_count?: number
          not_helpful_count?: number
          response_text?: string | null
          response_by?: string | null
          responded_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          review_type?: 'workshop' | 'expert' | 'engagement'
          workshop_id?: string | null
          expert_id?: string | null
          engagement_id?: string | null
          rating?: number
          title?: string | null
          review_text?: string
          content_quality_rating?: number | null
          delivery_rating?: number | null
          value_rating?: number | null
          impact_rating?: number | null
          verified_purchase?: boolean
          status?: 'pending' | 'approved' | 'rejected' | 'flagged'
          moderation_notes?: string | null
          helpful_count?: number
          not_helpful_count?: number
          response_text?: string | null
          response_by?: string | null
          responded_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { p_user_id: string; p_role: string }
        Returns: boolean
      }
      get_user_roles: {
        Args: { p_user_id: string }
        Returns: { role: string; organization_id: string | null }[]
      }
      get_available_workshops: {
        Args: {
          p_pillar?: string
          p_level?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          pillar: string
          level: string
          format: string
          schedule_date: string | null
          schedule_time: string | null
          capacity_remaining: number
          price_amount: number
          price_early_bird: number | null
          instructor_name: string
          is_featured: boolean
        }[]
      }
      get_user_workshop_history: {
        Args: { p_user_id: string }
        Returns: {
          workshop_id: string
          workshop_title: string
          status: string
          registered_at: string
          completed_at: string | null
          rating: number | null
          certificate_id: string | null
        }[]
      }
      get_user_latest_assessment: {
        Args: { p_user_id: string }
        Returns: {
          assessment_id: string
          overall_score: number | null
          individual_score: number | null
          leadership_score: number | null
          cultural_score: number | null
          embedding_score: number | null
          velocity_score: number | null
          completed_at: string | null
        }[]
      }
      get_assessment_progress: {
        Args: { p_assessment_id: string }
        Returns: {
          dimension: string
          total_questions: number
          answered_questions: number
          completion_percentage: number
        }[]
      }
      get_org_adaptability_trend: {
        Args: { p_organization_id: string; p_months?: number }
        Returns: {
          month: string
          avg_overall_score: number
          avg_individual_score: number
          avg_leadership_score: number
          avg_cultural_score: number
          avg_embedding_score: number
          avg_velocity_score: number
          assessment_count: number
        }[]
      }
      search_talent: {
        Args: {
          p_expertise?: string[]
          p_industries?: string[]
          p_min_rating?: number
          p_availability?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          profile_id: string
          user_name: string
          tagline: string
          expertise: string[]
          rating: number
          review_count: number
          hourly_rate: number
          availability: string
        }[]
      }
      get_client_engagement_summary: {
        Args: { p_client_id: string }
        Returns: {
          total_engagements: number
          active_engagements: number
          total_hours_purchased: number
          total_hours_used: number
          total_spent: number
        }[]
      }
      get_user_payment_history: {
        Args: { p_user_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          payment_id: string
          amount: number
          currency: string
          payment_type: string
          status: string
          created_at: string
        }[]
      }
      get_user_certificates: {
        Args: { p_user_id: string }
        Returns: {
          certificate_id: string
          title: string
          certificate_type: string
          certificate_number: string
          issue_date: string
          certificate_url: string | null
        }[]
      }
      get_workshop_reviews_summary: {
        Args: { p_workshop_id: string }
        Returns: {
          average_rating: number
          total_reviews: number
          rating_distribution: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
