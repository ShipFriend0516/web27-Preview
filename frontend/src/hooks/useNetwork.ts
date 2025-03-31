import useNetworkStore from "@stores/useNetworkStore.ts";

/*
  네트워크 품질 정보를 전역에서 접근할 수 있도록 하는 커스텀 훅
  
**/

const useNetwork = () => {
  const { networkStats } = useNetworkStore();

  const getNetworkStats = () => {
    return networkStats;
  };

  // 최근 N번의 네트워크 보고서의 평균으로 품질정보 계산
  const calculateAverageStats = (count: number) => {
    if (networkStats.length === 0) return null;
    const recentStats = networkStats.slice(-count);

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
      jitter: sum.jitter / count,
      rtt: sum.rtt / count,
      packetsLossRate: sum.packetsLossRate / count,
      bandwidth: sum.bandwidth / count,
    };

    return average;
  };

  const getNetworkQuality = () => {
    const averageStats = calculateAverageStats(5);
    if (!averageStats) return null;

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

    switch (qualityScore) {
      case 100:
        return "ultra";
      case 80:
        return "high";
      case 60:
        return "middle";
      case 40:
        return "low";
      default:
        return "very low";
    }
  };

  return { getNetworkStats, getNetworkQuality };
};
export default useNetwork;
