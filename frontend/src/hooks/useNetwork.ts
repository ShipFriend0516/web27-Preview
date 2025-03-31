import useNetworkStore from "@stores/useNetworkStore.ts";

/*
  네트워크 품질 정보를 전역에서 접근할 수 있도록 하는 커스텀 훅
  
**/

const useNetwork = () => {
  const {
    networkStats,
    updateNetworkStats,
    setCurrentNetworkQuality,
    currentNetworkQuality,
  } = useNetworkStore();

  const getNetworkStats = () => {
    return networkStats;
  };

  const addNetworkStats = (stats: {
    jitter: number;
    rtt: number;
    packetsLossRate: number;
    bandwidth: number;
  }) => {
    updateNetworkStats(stats);
  };

  const updateNetworkQuality = (
    quality: "ultra" | "high" | "medium" | "low" | "very-low"
  ) => {
    setCurrentNetworkQuality(quality);
  };

  const calculateAverageStats = (count: number) => {
    const networkStats = useNetworkStore.getState().networkStats;
    if (networkStats.length === 0) return null;

    // 실제 가용한 데이터 개수 계산
    const availableCount = Math.min(count, networkStats.length);
    const recentStats =
      networkStats.length > count ? networkStats.slice(-count) : networkStats;
    console.log("최근 5번", recentStats);
    const sum = recentStats.reduce(
      (acc, cur) => {
        acc.jitter += cur.jitter;
        acc.rtt += cur.rtt;
        acc.packetsLossRate += cur.packetsLossRate;
        acc.bandwidth += cur.bandwidth;
        return acc;
      },
      { jitter: 0, rtt: 0, packetsLossRate: 0, bandwidth: 0 }
    );

    const average = {
      jitter: sum.jitter / availableCount,
      rtt: sum.rtt / availableCount,
      packetsLossRate: sum.packetsLossRate / availableCount,
      bandwidth: sum.bandwidth / availableCount,
    };

    return average;
  };

  const getNetworkQuality = () => {
    const averageStats = calculateAverageStats(5);
    if (!averageStats) return null;
    console.log("최근 5회 네트워크 보고서", averageStats);
    const { jitter, rtt, packetsLossRate, bandwidth } = averageStats;

    const bandwidthMbps = bandwidth / 1000 / 1000;
    const rttMs = rtt * 1000; // 초를 밀리초로 변환
    const packetLossPercent = packetsLossRate * 100;
    const jitterMs = jitter * 1000; // 초를 밀리초로 변환

    let qualityScore = 0;

    if (bandwidthMbps >= 2.5) qualityScore += 40;
    else if (bandwidthMbps >= 1.0) qualityScore += 30;
    else if (bandwidthMbps >= 0.5) qualityScore += 20;
    else if (bandwidthMbps >= 0.25) qualityScore += 10;
    else qualityScore += 0;

    if (rttMs < 50) qualityScore += 25;
    else if (rttMs < 100) qualityScore += 20;
    else if (rttMs < 300) qualityScore += 15;
    else if (rttMs < 500) qualityScore += 5;
    else qualityScore += 0;

    if (packetLossPercent < 0.5) qualityScore += 25;
    else if (packetLossPercent < 2) qualityScore += 20;
    else if (packetLossPercent < 5) qualityScore += 15;
    else if (packetLossPercent < 10) qualityScore += 5;
    else qualityScore += 0;

    if (jitterMs < 10) qualityScore += 10;
    else if (jitterMs < 30) qualityScore += 8;
    else if (jitterMs < 50) qualityScore += 5;
    else if (jitterMs < 100) qualityScore += 2;
    else qualityScore += 0;

    console.log("네트워크 품질 점수", qualityScore);
    if (qualityScore > 80) {
      return "ultra";
    } else if (qualityScore > 60) {
      return "high";
    } else if (qualityScore > 40) {
      return "medium";
    } else if (qualityScore > 20) {
      return "low";
    } else {
      return "very-low";
    }
  };

  return {
    getNetworkStats,
    getNetworkQuality,
    updateNetworkQuality,
    addNetworkStats,
    currentNetworkQuality,
  };
};
export default useNetwork;
