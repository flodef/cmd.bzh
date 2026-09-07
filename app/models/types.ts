export interface DbReview {
  id: string;
  created_at: string;
  name: string;
  email: string;
  comment: string;
  rating: number; // DECIMAL(2,1) in database, represents values like 3.5
  published: boolean;
}

export interface NewReview {
  name: string;
  email: string;
  comment: string;
  rating: number;
}
