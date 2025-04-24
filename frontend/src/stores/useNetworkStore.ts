import { create } from "zustand";
import { NetworkStat } from "@/types/network";

interface NetworkState {
  networkStats: NetworkStat[];
  updateNetworkStats: (stats: NetworkStat) => void;
  cleanUpNetworkStats: () => void;
  currentNetworkQuality:
    | "ultra"
    | "high"
    | "medium"
    | "low"
    | "very-low"
    | null;
  setCurrentNetworkQuality: (
    quality: "ultra" | "high" | "medium" | "low" | "very-low" | null
  ) => void;
}

const useNetworkStore = create<NetworkState>((set) => ({
  networkStats: [],
  updateNetworkStats: (stats: NetworkStat) =>
    set((state) => {
      const newStat = { ...stats };

      const updatedStats = [...state.networkStats, newStat];
      if (updatedStats.length > 10) {
        updatedStats.shift();
      }

      return { networkStats: updatedStats };
    }),
  cleanUpNetworkStats: () =>
    set(() => ({
      networkStats: [],
    })),
  setCurrentNetworkQuality: (quality) =>
    set(() => ({
      currentNetworkQuality: quality,
    })),
  currentNetworkQuality: null,
}));

export default useNetworkStore;
