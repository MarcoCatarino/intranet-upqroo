import { create } from "zustand";
import type { Document, PaginatedResponse } from "@/types";
import { documentsApi } from "@/services/api";

interface DocumentsState {
  documents: Document[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchDocuments: (page?: number) => Promise<void>;
  searchDocuments: (q: string) => Promise<Document[]>;
  refresh: () => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>()((set, get) => ({
  documents: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  fetchDocuments: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res: PaginatedResponse<Document> = await documentsApi.list(page);
      set({
        documents: res.data,
        total: res.total,
        page: res.page,
        totalPages: res.totalPages,
      });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  searchDocuments: async (q: string) => documentsApi.search(q),

  refresh: () => get().fetchDocuments(get().page),
}));
