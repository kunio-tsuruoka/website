export type ColumnRef = {
  id: string;
  title: string;
  url: string;
  excerpt: string;
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  references?: ColumnRef[];
};

export type ChatApiResponse = {
  reply?: string;
  references?: ColumnRef[];
  error?: string;
  message?: string;
};
