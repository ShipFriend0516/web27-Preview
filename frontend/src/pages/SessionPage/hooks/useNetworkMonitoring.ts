import React, { useEffect, useRef } from "react";

interface UseNetworkMonitoringHookProps {
  peerConnections: React.MutableRefObject<{ [p: string]: RTCPeerConnection }>;
}

interface NetworkStat {
  jitter: number;
  rtt: number;
  packetsLossRate: number;
  bandwidth: number;
}

const useNetworkMonitoring = ({
  peerConnections,
}: UseNetworkMonitoringHookProps) => {
  const MONITORING_INTERVAL = 5000;
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

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
      integrateStats();
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

    const stats = await peerConnection.getStats();
    for (const value of stats.values()) {
      if (value.type === "inbound-rtp") {
        if (value.mediaType === "video") {
          networkStat.jitter = value.jitter;
          networkStat.packetsLost = value.packetsLost;
          networkStat.packetsReceived = value.packetsReceived;
          networkStat.packetsLossRate =
            value.packetsLost / value.packetsReceived;
        }
      } else if (value.type === "candidate-pair") {
        if (value.bytesSent > 0) {
          networkStat.rtt = value.currentRoundTripTime;
          networkStat.bytesReceived = value.bytesReceived;
        }
      } else if (value.type === "remote-outbound-rtp") {
        // console.log(value);
      } else if (value.type === "outbound-rtp") {
        networkStat.bytesSent = value.bytesSent;
      }
    }

    return {
      jitter: networkStat.jitter,
      rtt: networkStat.rtt,
      packetsLossRate: networkStat.packetsLossRate,
      bandwidth: networkStat.bytesSent + networkStat.bytesReceived,
    };
  };

  return {};
};

export default useNetworkMonitoring;
