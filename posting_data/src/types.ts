export interface PostingEvent {
  slug: string;
  title: string;
  description?: string;
  active: boolean;
}

export interface PostingEventsConfig {
  events: PostingEvent[];
}
