export type Idea = {
  id: string;
  user_id: string | null;
  name: string;
  description: string;
  target_customer: string;
  created_at: string;
};

export type IdeaInput = {
  name: string;
  description: string;
  target_customer: string;
};
