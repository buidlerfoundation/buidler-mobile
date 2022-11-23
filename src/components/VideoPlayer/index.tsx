import React, {
  memo,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
} from 'react';
import {ViewStyle} from 'react-native';
import Video from 'react-native-video';

type VideoPlayerProps = {
  paused?: boolean;
  uri: string;
  style?: ViewStyle;
};

const VideoPlayer = forwardRef(
  ({paused, uri, style}: VideoPlayerProps, ref) => {
    const [isPaused, setPaused] = useState(paused);
    const pause = useCallback(() => setPaused(true), []);
    const play = useCallback(() => setPaused(false), []);
    console.log('XXX: ', uri, isPaused);
    useImperativeHandle(ref, () => {
      return {
        pause,
        play,
      };
    });
    return (
      <Video
        source={{uri}}
        style={style}
        paused={isPaused}
        controls
        resizeMode="contain"
      />
    );
  },
);

export default memo(VideoPlayer);
