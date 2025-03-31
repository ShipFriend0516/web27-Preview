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
    set((state) => ({
      networkStats: [...state.networkStats, stats],
    })),
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
