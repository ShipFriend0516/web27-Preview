import { create } from "zustand";
import { NetworkStat } from "@/types/network";

interface NetworkState {
  networkStats: NetworkStat[];
  updateNetworkStats: (stats: NetworkStat) => void;
  cleanUpNetworkStats: () => void;
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
}));

export default useNetworkStore;
