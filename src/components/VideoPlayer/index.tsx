import React, {
  memo,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  useEffect,
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
    useImperativeHandle(ref, () => {
      return {
        pause,
        play,
      };
    });
    useEffect(() => {
      console.log('Start');
      return () => {
        console.log('End');
      };
    }, []);
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
