interface IQualityPreset {
  video: {
    width: number;
    height: number;
    frameRate: number;
    aspectRatio: number;
  };
}

interface IQualityPresetSet {
  high: IQualityPreset;
  middle: IQualityPreset;
  low: IQualityPreset;
}

export const QualityPreset: IQualityPresetSet = {
  high: {
    video: {
      width: 1920,
      height: 1080,
      frameRate: 30,
      aspectRatio: 4 / 3,
    },
  },

  middle: {
    video: {
      width: 640,
      height: 480,
      frameRate: 30,
      aspectRatio: 4 / 3,
    },
  },

  low: {
    video: {
      width: 320,
      height: 240,
      frameRate: 15,
      aspectRatio: 4 / 3,
    },
  },
};
