export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  description?: string | null;
  sort_order?: number;
  created_at?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  category_id?: string | null;
  brand?: string | null;
  price: number;
  discount_price?: number | null;
  quantity: number;
  low_stock_threshold: number;
  condition: string;
  status: "active" | "draft" | "sold_out";
  short_description?: string | null;
  description?: string | null;
  specs: Record<string, string>;
  images: string[];
  tags: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
};

export type Enquiry = {
  id: string;
  product_id?: string | null;
  product_name?: string | null;
  customer_name: string;
  phone: string;
  email?: string | null;
  quantity: number;
  preferred_time?: string | null;
  preferred_visit_date?: string | null;
  message?: string | null;
  status: "new" | "contacted" | "scheduled" | "completed" | "cancelled";
  follow_up_date?: string | null;
  internal_notes?: string | null;
  created_at: string;
};

export type WishRequest = {
  id: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  product_name: string;
  brand?: string | null;
  budget?: string | null;
  notes?: string | null;
  status: "pending" | "sourcing" | "available" | "closed";
  internal_notes?: string | null;
  created_at: string;
};

export type UpcomingProduct = {
  id: string;
  name: string;
  image_url?: string | null;
  expected_date?: string | null;
  description?: string | null;
  is_published: boolean;
  created_at: string;
};

export type NotifyRequest = {
  id: string;
  upcoming_product_id: string;
  customer_name?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  cover_image?: string | null;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  tags: string[];
  is_published: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  author?: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  subject?: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  role: "customer" | "admin";
  created_at: string;
};
export type GalleryAlbum = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  cover_image?: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  image_count?: number;
};

export type GalleryImage = {
  id: string;
  album_id: string | null;
  image_url: string;
  caption?: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
};