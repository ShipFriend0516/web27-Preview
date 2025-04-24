interface IQualityPreset {
  quality: "ultra" | "high" | "medium" | "low" | "very-low";
  video: {
    width: number;
    height: number;
    frameRate: number;
    videoBitrate: number;
  };
}

interface IQualityPresetSet {
  [key: string]: IQualityPreset;
}

export const QualityPreset: IQualityPresetSet = {
  ultra: {
    quality: "ultra",
    video: {
      width: 1280,
      height: 720,
      frameRate: 60,
      videoBitrate: 2500,
    },
  },
  high: {
    quality: "high",
    video: {
      width: 854,
      height: 480,
      frameRate: 30,
      videoBitrate: 1000,
    },
  },
  medium: {
    quality: "medium",
    video: {
      width: 640,
      height: 360,
      frameRate: 30,
      videoBitrate: 600,
    },
  },
  low: {
    quality: "low",
    video: {
      width: 320,
      height: 240,
      frameRate: 15,
      videoBitrate: 300,
    },
  },
  "very-low": {
    quality: "very-low",
    video: {
      width: 160,
      height: 120,
      frameRate: 5,
      videoBitrate: 150,
    },
  },
};
