import {
  BsCameraVideo,
  BsCameraVideoOff,
  BsHandThumbsUp,
  BsMic,
  BsMicMute,
} from "react-icons/bs";

interface CommonToolsProps {
  handleVideoToggle: () => void;
  handleMicToggle: () => void;
  emitReaction: (reactionType: string) => void;
  userVideoDevices: MediaDeviceInfo[];
  userAudioDevices: MediaDeviceInfo[];
  setSelectedVideoDeviceId: (deviceId: string) => void;
  setSelectedAudioDeviceId: (deviceId: string) => void;
  isVideoOn: boolean;
  isMicOn: boolean;
  videoLoading: boolean;
}
const CommonTools = ({
  handleVideoToggle,
  handleMicToggle,
  emitReaction,
  userVideoDevices,
  userAudioDevices,
  setSelectedVideoDeviceId,
  setSelectedAudioDeviceId,
  isVideoOn,
  isMicOn,
  videoLoading,
}: CommonToolsProps) => {
  return (
    <>
      <div className={"inline-flex center-buttons gap-2"}>
        <button
          disabled={videoLoading}
          onClick={handleVideoToggle}
          className="h-full aspect-square bg-green-500 hover:bg-green-600 text-white p-3 rounded-full disabled:opacity-50"
          aria-label={isVideoOn ? `비디오 끄기` : "비디오 켜기"}
        >
          {isVideoOn ? <BsCameraVideo /> : <BsCameraVideoOff />}
        </button>
        <button
          onClick={handleMicToggle}
          className="h-full aspect-square bg-green-500 hover:bg-green-600 text-white p-3 rounded-full"
          aria-label={isMicOn ? `마이크 끄기` : "마이크 켜기"}
        >
          {isMicOn ? <BsMic /> : <BsMicMute />}
        </button>
        <button
          onClick={() => emitReaction("thumbs_up")}
          className="h-full aspect-square bg-white text-green-500 border box-border border-accent-gray-50 hover:bg-grayscale-50 p-3 rounded-full"
          aria-label={"좋아요"}
        >
          {<BsHandThumbsUp />}
        </button>
        <select
          className={
            "max-w-40 bg-transparent text-gray-700 text-medium-xs border border-accent-gray py-2 px-2 rounded-xl hover:bg-gray-200"
          }
          onChange={(e) => setSelectedVideoDeviceId(e.target.value)}
        >
          {userVideoDevices.length > 0 ? (
            userVideoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))
          ) : (
            <option value={""}>발견된 비디오 장치가 없습니다.</option>
          )}
        </select>
        <select
          className={
            "max-w-40 bg-transparent text-gray-700 text-medium-xs border border-accent-gray py-2 px-2 rounded-xl hover:bg-gray-200"
          }
          onChange={(e) => setSelectedAudioDeviceId(e.target.value)}
        >
          {userAudioDevices.length > 0 ? (
            userAudioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))
          ) : (
            <option value={""}>발견된 오디오 장치가 없습니다.</option>
          )}
        </select>
      </div>
    </>
  );
};

export default CommonTools;