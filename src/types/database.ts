// Mirrors supabase/migrations. Once the project is linked, regenerate with:
//   npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts
// (then re-add the helper types at the bottom if they're not generated).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type OrderStatus = "Pending" | "Processing" | "Dispatched" | "Delivered";

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          category_id: string | null;
          is_on_sale: boolean;
          is_featured: boolean;
          stock_quantity: number | null;
          /** Generated: sale_price when on sale, otherwise price. Read-only. */
          effective_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price: number;
          sale_price?: number | null;
          category_id?: string | null;
          is_on_sale?: boolean;
          is_featured?: boolean;
          stock_quantity?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          category_id?: string | null;
          is_on_sale?: boolean;
          is_featured?: boolean;
          stock_quantity?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          is_primary: boolean;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          is_primary?: boolean;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          is_primary?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          /** e.g. WP-10001. */
          order_number: string;
          customer_name: string;
          phone: string;
          email: string | null;
          address: string;
          latitude: number | null;
          longitude: number | null;
          total_amount: number;
          status: OrderStatus;
          payment_method: string;
          idempotency_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          customer_name: string;
          phone: string;
          email?: string | null;
          address: string;
          latitude?: number | null;
          longitude?: number | null;
          total_amount: number;
          status?: OrderStatus;
          payment_method?: string;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_name?: string;
          phone?: string;
          email?: string | null;
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          total_amount?: number;
          status?: OrderStatus;
          payment_method?: string;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          quantity?: number;
          price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          customer_name: string;
          rating: number;
          comment: string | null;
          image_urls: string[];
          is_visible: boolean;
          is_verified: boolean;
          /** Not readable by the public. */
          order_id: string | null;
          /** Not readable by the public or admins; server-side rate limiting only. */
          submitter_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          customer_name: string;
          rating: number;
          comment?: string | null;
          image_urls?: string[];
          is_visible?: boolean;
          is_verified?: boolean;
          order_id?: string | null;
          submitter_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          customer_name?: string;
          rating?: number;
          comment?: string | null;
          image_urls?: string[];
          is_visible?: boolean;
          is_verified?: boolean;
          order_id?: string | null;
          submitter_hash?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_persons: {
        Row: {
          id: string;
          name: string;
          department: string;
          phone: string | null;
          is_whatsapp: boolean;
          email: string | null;
          hours: string | null;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          department: string;
          phone?: string | null;
          is_whatsapp?: boolean;
          email?: string | null;
          hours?: string | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          department?: string;
          phone?: string | null;
          is_whatsapp?: boolean;
          email?: string | null;
          hours?: string | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      /** Not readable by the public; inserted by the server only. */
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string;
          bio: string | null;
          image_url: string | null;
          phone: string | null;
          is_whatsapp: boolean;
          email: string | null;
          display_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          bio?: string | null;
          image_url?: string | null;
          phone?: string | null;
          is_whatsapp?: boolean;
          email?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          bio?: string | null;
          image_url?: string | null;
          phone?: string | null;
          is_whatsapp?: boolean;
          email?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      product_rating_summaries: {
        Row: {
          product_id: string;
          review_count: number;
          average_rating: number;
          one_star: number;
          two_star: number;
          three_star: number;
          four_star: number;
          five_star: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      set_primary_product_image: {
        Args: { p_image_id: string };
        Returns: undefined;
      };
      place_order: {
        Args: { p_customer: Json; p_items: Json; p_idempotency_key: string };
        Returns: Json;
      };
      admin_dashboard_stats: {
        Args: { p_days?: number; p_timezone?: string };
        Returns: Json;
      };
      consume_rate_limit: {
        Args: { p_bucket: string; p_identity: string; p_limit: number; p_window_seconds: number };
        Returns: boolean;
      };
    };
    Enums: {
      order_status: OrderStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type ProductImage = Tables<"product_images">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type Review = Tables<"reviews">;
export type ContactPerson = Tables<"contact_persons">;
export type ContactMessage = Tables<"contact_messages">;
export type TeamMember = Tables<"team_members">;
