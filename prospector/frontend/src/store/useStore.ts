/**
 * Zustand global store for PROSPECTOR
 */
import { create } from "zustand";
import type { EvsLeaderboardEntry, EvsStats, Asteroid } from "@/services/api";

interface ProspectorStore {
  // Leaderboard
  leaderboard: EvsLeaderboardEntry[];
  leaderboardTotal: number;
  setLeaderboard: (entries: EvsLeaderboardEntry[], total: number) => void;

  // EVS Stats
  evsStats: EvsStats | null;
  setEvsStats: (stats: EvsStats) => void;

  // Selected asteroid
  selectedAsteroid: Asteroid | null;
  setSelectedAsteroid: (a: Asteroid | null) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  error: string | null;
  setError: (e: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useStore = create<ProspectorStore>((set) => ({
  leaderboard: [],
  leaderboardTotal: 0,
  setLeaderboard: (entries, total) =>
    set({ leaderboard: entries, leaderboardTotal: total }),

  evsStats: null,
  setEvsStats: (stats) => set({ evsStats: stats }),

  selectedAsteroid: null,
  setSelectedAsteroid: (a) => set({ selectedAsteroid: a }),

  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),

  error: null,
  setError: (e) => set({ error: e }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
