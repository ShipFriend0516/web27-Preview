import { GiNetworkBars } from "react-icons/gi";
import useNetworkStore from "@stores/useNetworkStore.ts";

const NetworkMonitor = () => {
  const { networkStats } = useNetworkStore();

  return (
    <div className={"flex flex-col gap-3 mt-4"}>
      <h2 className={"inline-flex gap-1 items-center text-semibold-m"}>
        <GiNetworkBars />
        네트워크 모니터링
      </h2>
      <div>
        {networkStats.length === 0 ? (
          <p className={"text-medium-s"}>
            네트워크 품질이 기록되지 않았습니다.
          </p>
        ) : (
          <ul className={"list-disc flex flex-col gap-2 text-xs"}>
            <li className={"flex flex-col gap-1"}>
              RTT: {networkStats.at(-1)!.rtt} ms
            </li>
            <li className={"flex flex-col gap-1"}>
              Jitter: {networkStats.at(-1)!.jitter} ms
            </li>
            <li className={"flex flex-col gap-1"}>
              패킷 손실률: {networkStats.at(-1)!.packetsLossRate} %
            </li>
            <li className={"flex flex-col gap-1"}>
              대역폭:{" "}
              {(networkStats.at(-1)!.bandwidth / 1000 / 1000).toFixed(2)} mbps
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default NetworkMonitor;
