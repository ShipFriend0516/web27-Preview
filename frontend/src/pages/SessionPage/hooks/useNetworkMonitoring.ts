import React, { useEffect, useRef } from "react";
import { NetworkStat } from "@/types/network";
import useNetwork from "@hooks/useNetwork.ts";

interface UseNetworkMonitoringHookProps {
  peerConnections: React.MutableRefObject<{ [p: string]: RTCPeerConnection }>;
}

const useNetworkMonitoring = ({
  peerConnections,
}: UseNetworkMonitoringHookProps) => {
  const MONITORING_INTERVAL = 5000;
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const { addNetworkStats, getNetworkQuality, updateNetworkQuality } =
    useNetwork();

  const prevStats = useRef<{
    timestamp: number;
    totalBytes: number;
  }>({
    timestamp: 0,
    totalBytes: 0,
  });

  useEffect(() => {
    // 피어커넥션에 변동이 있을 때마다, 네트워크 모니터링

    if (!peerConnections.current) return;

    initializeMonitoring();
    return () => {
      cleanUpMonitoring();
    };
  }, [peerConnections]);

  const initializeMonitoring = () => {
    const interval = setInterval(() => {
      if (Object.keys(peerConnections.current).length > 0) integrateStats();
      if (Object.keys(peerConnections.current).length > 0) {
        const quality = getNetworkQuality();
        if (quality) {
          console.log("현재 네트워크 점수" + quality);
          updateNetworkQuality(quality);
        }
      }
    }, MONITORING_INTERVAL);

    intervalRef.current = interval;
  };

  const cleanUpMonitoring = () => {
    clearInterval(intervalRef.current);
  };

  const integrateStats = async () => {
    // 내 피어들과의 피어커넥션의 모든 통계의 평균을 내는 함수
    // 이걸 기준으로 네트워크 품질을 결정
    const integratedStats = {
      jitter: 0,
      rtt: 0,
      packetsLossRate: 0,
      bandwidth: 0,
    };

    const statPerPeer: NetworkStat[] = [];

    for (const peerConnection of Object.values(peerConnections.current)) {
      const stats = await monitorNetwork(peerConnection);
      if (!stats) continue;
      statPerPeer.push(stats);
    }

    const sumOfStat = statPerPeer.reduce(
      (acc: NetworkStat, cur: NetworkStat) => {
        if (!cur) return acc;
        if (cur.bandwidth === 0) return acc;
        acc.jitter += cur.jitter;
        acc.rtt += cur.rtt;
        acc.packetsLossRate += cur.packetsLossRate;
        acc.bandwidth += cur.bandwidth;
        return acc;
      }
    );

    integratedStats.jitter = sumOfStat.jitter / statPerPeer.length;
    integratedStats.rtt = sumOfStat.rtt / statPerPeer.length;
    integratedStats.packetsLossRate =
      sumOfStat.packetsLossRate / statPerPeer.length;
    integratedStats.bandwidth = sumOfStat.bandwidth / statPerPeer.length;

    console.log("네트워크 보고서", integratedStats);
    addNetworkStats(integratedStats);
    return integratedStats;
  };

  const monitorNetwork = async (
    peerConnection: RTCPeerConnection
  ): Promise<NetworkStat | null> => {
    // 하나의 피어 커넥션에 대해서 모니터링하는 함수
    if (!peerConnections.current) return null;

    const networkStat = {
      jitter: 0,
      rtt: 0,
      packetsLost: 0,
      packetsReceived: 0,
      packetsTotal: 0,
      bytesSent: 0,
      bytesReceived: 0,
      packetsLossRate: 0,
      bandwidth: 0,
    };

    const currentTimestamp = Date.now();
    const stats = await peerConnection.getStats();

    for (const value of stats.values()) {
      if (value.type === "inbound-rtp") {
        if (value.mediaType === "video") {
          networkStat.jitter = value.jitter;
          networkStat.packetsLost = value.packetsLost;
          networkStat.packetsReceived = value.packetsReceived;
          networkStat.packetsLossRate =
            value.packetsLost / (value.packetsReceived || 1); // 0으로 나누기 방지
        }
      } else if (value.type === "candidate-pair") {
        if (value.bytesSent > 0) {
          networkStat.rtt = value.currentRoundTripTime;
          networkStat.bytesReceived = value.bytesReceived;
        }
      } else if (value.type === "outbound-rtp") {
        networkStat.bytesSent = value.bytesSent;
      }
    }

    // 현재 총 바이트
    const currentTotalBytes = networkStat.bytesSent + networkStat.bytesReceived;

    // 대역폭 계산 (bps)
    if (prevStats.current.timestamp > 0) {
      const byteDiff = currentTotalBytes - prevStats.current.totalBytes;
      const timeDiffInSeconds =
        (currentTimestamp - prevStats.current.timestamp) / 1000;

      if (timeDiffInSeconds > 0) {
        // 바이트를 비트로 변환 (1 바이트 = 8 비트)
        const bitsPerSecond = (byteDiff * 8) / timeDiffInSeconds;

        // const mbps = bitsPerSecond / 1000000;

        networkStat.bandwidth = bitsPerSecond; // bps 단위로 저장
      }
    }

    // 현재 값을 다음 계산을 위해 저장
    prevStats.current = {
      timestamp: currentTimestamp,
      totalBytes: currentTotalBytes,
    };

    return {
      jitter: networkStat.jitter,
      rtt: networkStat.rtt,
      packetsLossRate: networkStat.packetsLossRate,
      bandwidth: networkStat.bandwidth, // bps 단위
    };
  };
};

export default useNetworkMonitoring;
