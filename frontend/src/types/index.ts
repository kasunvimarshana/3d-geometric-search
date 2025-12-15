export interface Model3D {
  id: number;
  name: string;
  original_filename: string;
  file_format: string;
  file_size: number;
  vertex_count?: number;
  face_count?: number;
  volume?: number;
  surface_area?: number;
  compactness?: number;
  bounding_box?: {
    min: number[];
    max: number[];
  };
  category?: string;
  tags?: string[];
  description?: string;
  thumbnail_path?: string;
  created_at: string;
  updated_at?: string;
}

export interface SearchResult {
  model: Model3D;
  similarity_score: number;
  distance: number;
}

export interface SearchResponse {
  query_id: number;
  results: SearchResult[];
  processing_time: number;
  total_results: number;
}

export interface StatsResponse {
  total_models: number;
  total_searches: number;
  indexed_models: number;
  storage_used: number;
  avg_processing_time: number;
}
