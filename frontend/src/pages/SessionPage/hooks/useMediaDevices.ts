import { MutableRefObject, useEffect, useRef, useState } from "react";

type MediaStreamType = "video" | "audio";
interface PeerConnectionsMap {
  [key: string]: RTCPeerConnection;
}

type DataChannels = MutableRefObject<{ [peerId: string]: RTCDataChannel }>;
interface DataChannelMessage {
  type: "audio" | "video";
  status: boolean;
}

const useMediaDevices = (dataChannels: DataChannels) => {
  // 유저의 미디어 장치 리스트
  const [userAudioDevices, setUserAudioDevices] = useState<MediaDeviceInfo[]>(
    []
  );
  const [userVideoDevices, setUserVideoDevices] = useState<MediaDeviceInfo[]>(
    []
  );

  // 유저가 선택한 미디어 장치
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] =
    useState<string>("");
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] =
    useState<string>("");

  // 본인 미디어 스트림
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [videoLoading, setVideoLoading] = useState<boolean>(false);
  // const [audioLoading, setAudioLoading] = useState<boolean>(false);

  // 미디어 온오프 상태
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);

  useEffect(() => {
    // 비디오 디바이스 목록 가져오기
    const getUserDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(
          (device) => device.kind === "audioinput"
        );
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        const dontHavePermission =
          devices.find((device) => device.deviceId !== "") === undefined;
        if (dontHavePermission) {
          setUserAudioDevices([]);
          setUserVideoDevices([]);
        } else {
          setUserAudioDevices(audioDevices);
          setUserVideoDevices(videoDevices);
        }
      } catch (error) {
        console.error("미디어 기기를 찾는데 문제가 발생했습니다.", error);
      }
    };

    getUserDevices();
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const getMedia = async (videoOn = true) => {
    try {
      if (streamRef.current) {
        // 이미 스트림이 있으면 종료
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        setStream(null);
      }
      setVideoLoading(true);

      // 비디오와 오디오 스트림을 따로 가져오기
      let videoStream = null;
      let audioStream = null;

      try {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: videoOn
            ? selectedVideoDeviceId
              ? { deviceId: selectedVideoDeviceId }
              : true
            : false,
          audio: false,
        });
      } catch (videoError) {
        console.warn("비디오 스트림을 가져오는데 실패했습니다:", videoError);
        setIsVideoOn(false);
      }

      console.log(isVideoOn);

      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: selectedAudioDeviceId
            ? { deviceId: selectedAudioDeviceId }
            : true,
        });
      } catch (audioError) {
        console.warn("오디오 스트림을 가져오는데 실패했습니다:", audioError);
        setIsMicOn(false);
      }

      // 스트림 병합 또는 개별 스트림 사용
      let combinedStream = null;
      const tracks = [
        ...(videoStream?.getVideoTracks() || []),
        ...(audioStream?.getAudioTracks() || []),
      ];

      if (tracks.length > 0) {
        combinedStream = new MediaStream(tracks);
        streamRef.current = combinedStream;
        setStream(combinedStream);
        return combinedStream;
      } else {
        throw new Error(
          "비디오와 오디오 스트림을 모두 가져오는데 실패했습니다."
        );
      }
    } catch (error) {
      console.error(
        "미디어 스트림을 가져오는 도중 문제가 발생했습니다.",
        error
      );
      // 에러 처리 로직 (예: 사용자에게 알림)
    } finally {
      setVideoLoading(false);
    }
  };

  // 특정 미디어 스트림만 가져오는 함수
  const getMediaStream = async (mediaType: MediaStreamType) => {
    try {
      return navigator.mediaDevices.getUserMedia(
        mediaType === "audio"
          ? {
              audio: selectedAudioDeviceId
                ? { deviceId: selectedAudioDeviceId }
                : true,
            }
          : {
              video: selectedVideoDeviceId
                ? { deviceId: selectedVideoDeviceId }
                : true,
            }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessageToDataChannels = (message: DataChannelMessage) => {
    Object.values(dataChannels.current).forEach((channel) => {
      channel.send(JSON.stringify(message));
    });
  };

  // 미디어 스트림 토글 관련
  const handleVideoToggle = async (peerConnections: PeerConnectionsMap) => {
    try {
      if (!stream) return;
      setVideoLoading(true);

      // 비디오 껐다키기
      if (isVideoOn) {
        for (const videoTrack of stream.getVideoTracks()) {
          // 비디오 끄기
          if (!videoTrack.enabled) {
            setIsVideoOn((prev) => !prev);
            return;
          }
          videoTrack.stop();

          const blackCanvas = document.createElement("canvas");
          blackCanvas.width = 640;
          blackCanvas.height = 480;
          const ctx = blackCanvas.getContext("2d");
          ctx!.fillRect(0, 0, blackCanvas.width, blackCanvas.height);

          const blackStream = blackCanvas.captureStream();
          const blackTrack = blackStream.getVideoTracks()[0];
          Object.values(peerConnections || {}).forEach((pc) => {
            const sender = pc
              .getSenders()
              .find((s) => s.track!.kind === "video");
            if (sender) {
              sender.replaceTrack(blackTrack);
            }
          });
        }
        setIsVideoOn((prev) => !prev);
        sendMessageToDataChannels({
          type: "video",
          status: false,
        });
      } else {
        const videoStream = await getMediaStream("video");
        if (!videoStream) return;

        const newVideoTrack = videoStream.getVideoTracks()[0];

        if (videoStream) {
          if (streamRef.current) {
            const oldVideoTracks = streamRef.current.getVideoTracks();
            oldVideoTracks.forEach((track) =>
              streamRef.current?.removeTrack(track)
            );

            streamRef.current.addTrack(newVideoTrack);
            setStream(streamRef.current);

            Object.values(peerConnections || {}).forEach((pc) => {
              const sender = pc
                .getSenders()
                .find((s) => s.track?.kind === "video");
              if (sender) {
                sender.replaceTrack(newVideoTrack);
              }
            });
          }
        } else {
          console.error("비디오 스트림을 생성하지 못했습니다.");
        }
        setIsVideoOn((prev) => !prev);
        sendMessageToDataChannels({
          type: "video",
          status: true,
        });
      }
    } catch (error) {
      console.error("비디오 스트림을 토글 할 수 없었습니다.", error);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleMicToggle = async () => {
    try {
      if (!stream) return;

      if (isMicOn) {
        for (const audioTrack of stream.getAudioTracks()) {
          if (!audioTrack.enabled) {
            setIsMicOn((prev) => !prev);
            return;
          }
          audioTrack.enabled = false;

          setIsMicOn((prev) => !prev);
          sendMessageToDataChannels({
            type: "audio",
            status: false,
          });
        }
      } else {
        for (const audioTrack of stream.getAudioTracks()) {
          audioTrack.enabled = true;
        }
        setIsMicOn((prev) => !prev);
        sendMessageToDataChannels({
          type: "audio",
          status: true,
        });
      }
    } catch (error) {
      console.error("오디오 스트림을 토글 할 수 없었습니다.", error);
    }
  };

  return {
    userAudioDevices,
    userVideoDevices,
    selectedAudioDeviceId,
    selectedVideoDeviceId,
    stream,
    isVideoOn,
    isMicOn,
    setIsVideoOn,
    videoLoading,
    handleMicToggle,
    handleVideoToggle,
    setSelectedAudioDeviceId,
    setSelectedVideoDeviceId,
    getMedia,
    getMediaStream,
  };
};

export default useMediaDevices;
