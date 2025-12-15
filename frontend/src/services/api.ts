import axios from "axios";
import type { Model3D, SearchResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Search by upload
export const searchByUpload = async (
  file: File,
  k: number = 20
): Promise<SearchResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/api/search/upload?k=${k}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Get all models
export const getModels = async (
  category?: string,
  skip: number = 0,
  limit: number = 100
): Promise<Model3D[]> => {
  const params = new URLSearchParams();
  params.append("skip", skip.toString());
  params.append("limit", limit.toString());
  if (category) params.append("category", category);

  const response = await api.get(`/api/models?${params.toString()}`);
  return response.data;
};

// Get single model
export const getModel = async (id: number): Promise<Model3D> => {
  const response = await api.get(`/api/models/${id}`);
  return response.data;
};

// Upload and index model
export const uploadModel = async (
  file: File,
  name: string,
  category?: string,
  description?: string
): Promise<Model3D> => {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();
  params.append("name", name);
  if (category) params.append("category", category);
  if (description) params.append("description", description);

  const response = await api.post(
    `/api/models/index?${params.toString()}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Delete model
export const deleteModel = async (id: number): Promise<void> => {
  await api.delete(`/api/models/${id}`);
};

// Get statistics
export const getStats = async (): Promise<any> => {
  const response = await api.get("/api/admin/stats");
  return response.data;
};

export default api;
