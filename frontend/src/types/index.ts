export interface CatTrait {
  id: number;
  name: string;
  slug: string;
  category: string;
}

export interface UserSummary {
  id: number;
  name: string;
  avatar_url: string | null;
  city: string | null;
  is_verified: boolean;
  rating: number;
  review_count: number;
  response_rate: number;
  avg_response_minutes: number;
}

export interface User extends UserSummary {
  email: string;
  is_admin: boolean;
}

export interface CatPhoto {
  id: number;
  url: string;
  sort_order: number;
}

export interface CatListing {
  id: number;
  slug: string;
  name: string;
  breed: string;
  age_months: number;
  age_label: string;
  gender: string;
  location: string;
  description?: string;
  rehome_reason?: string;
  adoption_fee_cents: number;
  status: "available" | "pending" | "adopted";
  is_featured?: boolean;
  rating: number;
  review_count: number;
  posted_at: string;
  posted_ago: string;
  primary_photo_url: string | null;
  photos?: CatPhoto[];
  traits?: CatTrait[];
  owner?: UserSummary;
  is_saved?: boolean;
}

export interface Review {
  id: number;
  rating: number;
  body: string | null;
  created_at: string;
  user?: UserSummary;
}

export interface AdoptionApplication {
  id: number;
  message: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  created_at: string;
  cat?: CatListing;
  adopter?: UserSummary;
}

export interface PublicUser extends UserSummary {
  listings_count?: number;
  listings?: CatListing[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: Record<string, string | null>;
}

export interface Stats {
  verified_owners: number;
  successful_adoptions: number;
  identity_verified_percent: number;
  cities_covered: number;
  cats_available: number;
}

export interface Message {
  id: number;
  body: string;
  sender_id: number;
  is_mine: boolean;
  read_at: string | null;
  created_at: string;
  created_ago: string;
}

export interface Conversation {
  id: number;
  cat?: CatListing;
  other_user?: UserSummary;
  latest_message?: Message;
  unread_count?: number;
  updated_at: string;
  messages?: Message[];
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  conversation_id: number;
  created_at: string;
}

export interface CatFilters {
  search?: string;
  gender?: string;
  breed?: string;
  max_age_months?: number;
  max_fee_cents?: number;
  traits?: string;
  sort?: string;
  page?: number;
}
