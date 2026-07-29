export interface system_doc {
  id: number;
  system_id: number;
  title: string;
  content: Record<string, any>;
  created_at: string;
}

export interface service_doc {
  id: number;
  service_id: number;
  title: string;
  content: Record<string, any>;
  created_at: string;
}