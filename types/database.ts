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
      churches: {
        Row: {
          id: string
          church_id: string
          name: string
          owner_email: string
          plan: 'Free' | 'Pro' | 'Enterprise'
          status: 'Active' | 'Suspended' | 'Inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          name: string
          owner_email: string
          plan?: 'Free' | 'Pro' | 'Enterprise'
          status?: 'Active' | 'Suspended' | 'Inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          name?: string
          owner_email?: string
          plan?: 'Free' | 'Pro' | 'Enterprise'
          status?: 'Active' | 'Suspended' | 'Inactive'
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: 'Admin' | 'Teacher' | 'Student'
          church_id: string | null
          status: 'Active' | 'Inactive' | 'Suspended'
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'Admin' | 'Teacher' | 'Student'
          church_id?: string | null
          status?: 'Active' | 'Inactive' | 'Suspended'
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'Admin' | 'Teacher' | 'Student'
          church_id?: string | null
          status?: 'Active' | 'Inactive' | 'Suspended'
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      prayers: {
        Row: {
          id: string
          prayer_id: string
          church_id: string | null
          title: string | null
          content: string
          name: string | null
          email: string | null
          status: 'Pending' | 'Approved' | 'Rejected' | 'Answered'
          is_anonymous: boolean
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          prayer_id: string
          church_id?: string | null
          title?: string | null
          content: string
          name?: string | null
          email?: string | null
          status?: 'Pending' | 'Approved' | 'Rejected' | 'Answered'
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          prayer_id?: string
          church_id?: string | null
          title?: string | null
          content?: string
          name?: string | null
          email?: string | null
          status?: 'Pending' | 'Approved' | 'Rejected' | 'Answered'
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
      }
      sermons: {
        Row: {
          id: string
          sermon_id: string
          church_id: string | null
          title: string
          speaker: string | null
          category: string | null
          description: string | null
          video_url: string | null
          audio_url: string | null
          notes_url: string | null
          date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sermon_id: string
          church_id?: string | null
          title: string
          speaker?: string | null
          category?: string | null
          description?: string | null
          video_url?: string | null
          audio_url?: string | null
          notes_url?: string | null
          date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sermon_id?: string
          church_id?: string | null
          title?: string
          speaker?: string | null
          category?: string | null
          description?: string | null
          video_url?: string | null
          audio_url?: string | null
          notes_url?: string | null
          date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gamification: {
        Row: {
          id: string
          user_id: string
          church_id: string | null
          xp: number
          level: number
          last_reason: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          church_id?: string | null
          xp?: number
          level?: number
          last_reason?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          church_id?: string | null
          xp?: number
          level?: number
          last_reason?: string | null
          updated_at?: string
        }
      }
      btc_wallets: {
        Row: {
          id: string
          user_id: string
          church_id: string | null
          btc: number
          last_reason: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          church_id?: string | null
          btc?: number
          last_reason?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          church_id?: string | null
          btc?: number
          last_reason?: string | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          timestamp: string
          user_id: string | null
          action: string
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          timestamp?: string
          user_id?: string | null
          action: string
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          timestamp?: string
          user_id?: string | null
          action?: string
          meta?: Json | null
          created_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          token: string
          church_id: string | null
          email: string
          role: 'Admin' | 'Teacher' | 'Student'
          status: 'Pending' | 'Accepted' | 'Expired'
          expires_at: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          token: string
          church_id?: string | null
          email: string
          role: 'Admin' | 'Teacher' | 'Student'
          status?: 'Pending' | 'Accepted' | 'Expired'
          expires_at: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          token?: string
          church_id?: string | null
          email?: string
          role?: 'Admin' | 'Teacher' | 'Student'
          status?: 'Pending' | 'Accepted' | 'Expired'
          expires_at?: string
          created_by?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          event_id: string
          church_id: string | null
          title: string
          description: string | null
          category: string | null
          event_date: string
          event_time: string | null
          end_date: string | null
          end_time: string | null
          location: string | null
          zoom_url: string | null
          is_online: boolean
          registration_required: boolean
          price: number
          currency: string
          capacity: number | null
          status: 'Draft' | 'Published' | 'Cancelled' | 'Completed'
          featured_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          church_id?: string | null
          title: string
          description?: string | null
          category?: string | null
          event_date: string
          event_time?: string | null
          end_date?: string | null
          end_time?: string | null
          location?: string | null
          zoom_url?: string | null
          is_online?: boolean
          registration_required?: boolean
          price?: number
          currency?: string
          capacity?: number | null
          status?: 'Draft' | 'Published' | 'Cancelled' | 'Completed'
          featured_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          church_id?: string | null
          title?: string
          description?: string | null
          category?: string | null
          event_date?: string
          event_time?: string | null
          end_date?: string | null
          end_time?: string | null
          location?: string | null
          zoom_url?: string | null
          is_online?: boolean
          registration_required?: boolean
          price?: number
          currency?: string
          capacity?: number | null
          status?: 'Draft' | 'Published' | 'Cancelled' | 'Completed'
          featured_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          church_id: string | null
          user_id: string | null
          name: string
          email: string
          phone: string | null
          status: 'Registered' | 'Cancelled' | 'Attended' | 'No-Show'
          registered_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          church_id?: string | null
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          status?: 'Registered' | 'Cancelled' | 'Attended' | 'No-Show'
          registered_at?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          church_id?: string | null
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          status?: 'Registered' | 'Cancelled' | 'Attended' | 'No-Show'
          registered_at?: string
          notes?: string | null
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          post_id: string
          church_id: string | null
          title: string
          slug: string
          content: string
          excerpt: string | null
          author: string | null
          category: 'Prophetic' | 'Devotional' | 'Teaching' | 'Announcement' | null
          tags: string[] | null
          featured_image: string | null
          published_at: string | null
          status: 'Draft' | 'Published' | 'Archived'
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          church_id?: string | null
          title: string
          slug: string
          content: string
          excerpt?: string | null
          author?: string | null
          category?: 'Prophetic' | 'Devotional' | 'Teaching' | 'Announcement' | null
          tags?: string[] | null
          featured_image?: string | null
          published_at?: string | null
          status?: 'Draft' | 'Published' | 'Archived'
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          church_id?: string | null
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          author?: string | null
          category?: 'Prophetic' | 'Devotional' | 'Teaching' | 'Announcement' | null
          tags?: string[] | null
          featured_image?: string | null
          published_at?: string | null
          status?: 'Draft' | 'Published' | 'Archived'
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          donation_id: string
          church_id: string | null
          user_id: string | null
          amount: number
          currency: string
          payment_method: 'Stripe' | 'PayPal' | 'Other'
          payment_id: string | null
          stripe_payment_intent_id: string | null
          paypal_order_id: string | null
          donor_name: string | null
          donor_email: string
          is_recurring: boolean
          recurring_id: string | null
          status: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Cancelled'
          receipt_sent: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          church_id?: string | null
          user_id?: string | null
          amount: number
          currency?: string
          payment_method: 'Stripe' | 'PayPal' | 'Other'
          payment_id?: string | null
          stripe_payment_intent_id?: string | null
          paypal_order_id?: string | null
          donor_name?: string | null
          donor_email: string
          is_recurring?: boolean
          recurring_id?: string | null
          status?: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Cancelled'
          receipt_sent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          church_id?: string | null
          user_id?: string | null
          amount?: number
          currency?: string
          payment_method?: 'Stripe' | 'PayPal' | 'Other'
          payment_id?: string | null
          stripe_payment_intent_id?: string | null
          paypal_order_id?: string | null
          donor_name?: string | null
          donor_email?: string
          is_recurring?: boolean
          recurring_id?: string | null
          status?: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Cancelled'
          receipt_sent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      volunteers: {
        Row: {
          id: string
          volunteer_id: string
          church_id: string | null
          user_id: string | null
          name: string
          email: string
          phone: string | null
          department: 'Prayer' | 'Media' | 'Events' | 'Teaching' | 'Administration' | 'Outreach'
          skills: string[] | null
          availability: string | null
          status: 'Pending' | 'Active' | 'Inactive' | 'Rejected'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          volunteer_id: string
          church_id?: string | null
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          department: 'Prayer' | 'Media' | 'Events' | 'Teaching' | 'Administration' | 'Outreach'
          skills?: string[] | null
          availability?: string | null
          status?: 'Pending' | 'Active' | 'Inactive' | 'Rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          volunteer_id?: string
          church_id?: string | null
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          department?: 'Prayer' | 'Media' | 'Events' | 'Teaching' | 'Administration' | 'Outreach'
          skills?: string[] | null
          availability?: string | null
          status?: 'Pending' | 'Active' | 'Inactive' | 'Rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      memberships: {
        Row: {
          id: string
          membership_id: string
          church_id: string | null
          user_id: string | null
          name: string
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          date_of_birth: string | null
          baptism_date: string | null
          previous_church: string | null
          how_did_you_hear: string | null
          interests: string[] | null
          commitment_level: 'Regular' | 'Associate' | 'Full'
          status: 'Pending' | 'Active' | 'Inactive' | 'Rejected'
          notes: string | null
          welcome_email_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          membership_id: string
          church_id?: string | null
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          date_of_birth?: string | null
          baptism_date?: string | null
          previous_church?: string | null
          how_did_you_hear?: string | null
          interests?: string[] | null
          commitment_level?: 'Regular' | 'Associate' | 'Full'
          status?: 'Pending' | 'Active' | 'Inactive' | 'Rejected'
          notes?: string | null
          welcome_email_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          membership_id?: string
          church_id?: string | null
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          date_of_birth?: string | null
          baptism_date?: string | null
          previous_church?: string | null
          how_did_you_hear?: string | null
          interests?: string[] | null
          commitment_level?: 'Regular' | 'Associate' | 'Full'
          status?: 'Pending' | 'Active' | 'Inactive' | 'Rejected'
          notes?: string | null
          welcome_email_sent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      email_subscriptions: {
        Row: {
          id: string
          email: string
          church_id: string | null
          source: string | null
          status: 'Subscribed' | 'Unsubscribed' | 'Bounced'
          subscribed_at: string
          unsubscribed_at: string | null
          unsubscribe_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          church_id?: string | null
          source?: string | null
          status?: 'Subscribed' | 'Unsubscribed' | 'Bounced'
          subscribed_at?: string
          unsubscribed_at?: string | null
          unsubscribe_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          church_id?: string | null
          source?: string | null
          status?: 'Subscribed' | 'Unsubscribed' | 'Bounced'
          subscribed_at?: string
          unsubscribed_at?: string | null
          unsubscribe_token?: string | null
          created_at?: string
        }
      }
      social_media_posts: {
        Row: {
          id: string
          platform: 'Instagram' | 'Facebook' | 'Twitter' | 'YouTube'
          post_id: string
          church_id: string | null
          content: string | null
          media_url: string | null
          posted_at: string | null
          cached_at: string
        }
        Insert: {
          id?: string
          platform: 'Instagram' | 'Facebook' | 'Twitter' | 'YouTube'
          post_id: string
          church_id?: string | null
          content?: string | null
          media_url?: string | null
          posted_at?: string | null
          cached_at?: string
        }
        Update: {
          id?: string
          platform?: 'Instagram' | 'Facebook' | 'Twitter' | 'YouTube'
          post_id?: string
          church_id?: string | null
          content?: string | null
          media_url?: string | null
          posted_at?: string | null
          cached_at?: string
        }
      }
      leadership_profiles: {
        Row: {
          id: string
          church_id: string | null
          name: string
          role: string
          bio: string
          image_url: string | null
          email: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id?: string | null
          name: string
          role: string
          bio: string
          image_url?: string | null
          email?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string | null
          name?: string
          role?: string
          bio?: string
          image_url?: string | null
          email?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ministry_content: {
        Row: {
          id: string
          church_id: string | null
          intro_video_url: string | null
          ministry_photos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id?: string | null
          intro_video_url?: string | null
          ministry_photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string | null
          intro_video_url?: string | null
          ministry_photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
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
  }
}

