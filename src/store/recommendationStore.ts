import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IntradayRecommendation, ExitReason } from '@/types/recommendation';

interface RecommendationStore {
  intradayRecommendations: IntradayRecommendation[];
  addIntradayRecommendation: (rec: Omit<IntradayRecommendation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIntradayRecommendation: (id: string, rec: Partial<IntradayRecommendation>) => void;
  deleteIntradayRecommendation: (id: string) => void;
  updateCurrentPrice: (id: string, price: number) => void;
  exitRecommendation: (id: string, exitReason: ExitReason, exitPrice?: number) => void;
}

export const useRecommendationStore = create<RecommendationStore>()(
  persist(
    (set) => ({
      intradayRecommendations: [],
      
      addIntradayRecommendation: (rec) => {
        const newRec: IntradayRecommendation = {
          ...rec,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          intradayRecommendations: [newRec, ...state.intradayRecommendations],
        }));
      },

      updateIntradayRecommendation: (id, rec) => {
        set((state) => ({
          intradayRecommendations: state.intradayRecommendations.map((r) =>
            r.id === id ? { ...r, ...rec, updatedAt: new Date() } : r
          ),
        }));
      },

      deleteIntradayRecommendation: (id) => {
        set((state) => ({
          intradayRecommendations: state.intradayRecommendations.filter((r) => r.id !== id),
        }));
      },

      updateCurrentPrice: (id, price) => {
        set((state) => ({
          intradayRecommendations: state.intradayRecommendations.map((r) =>
            r.id === id ? { ...r, currentPrice: price, updatedAt: new Date() } : r
          ),
        }));
      },

      exitRecommendation: (id, exitReason, exitPrice) => {
        set((state) => ({
          intradayRecommendations: state.intradayRecommendations.map((r) =>
            r.id === id 
              ? { 
                  ...r, 
                  exitReason, 
                  exitPrice,
                  exitedAt: new Date(),
                  updatedAt: new Date() 
                } 
              : r
          ),
        }));
      },
    }),
    {
      name: 'stockpicker-recommendations',
      // Serialize dates properly
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          if (parsed.state?.intradayRecommendations) {
            parsed.state.intradayRecommendations = parsed.state.intradayRecommendations.map((r: any) => ({
              ...r,
              createdAt: new Date(r.createdAt),
              updatedAt: new Date(r.updatedAt),
              exitedAt: r.exitedAt ? new Date(r.exitedAt) : undefined,
            }));
          }
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
