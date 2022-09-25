import {useNavigation} from '@react-navigation/native';
import {getTasks} from 'actions/TaskActions';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import ChannelIcon from 'components/ChannelIcon';
import PinPostItem from 'components/PinPostItem';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useCurrentChannel from 'hook/useCurrentChannel';
import usePinPosts from 'hook/usePinPosts';
import useThemeColor from 'hook/useThemeColor';
import {TaskData} from 'models';
import React, {memo, useCallback, useEffect} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';

const PinPostScreen = () => {
  const dispatch = useAppDispatch();
  const pinPosts = usePinPosts();
  const navigation = useNavigation();
  const currentChannel = useCurrentChannel();
  const {colors} = useThemeColor();
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  useEffect(() => {
    dispatch(getTasks(currentChannel.channel_id));
  }, [currentChannel.channel_id, dispatch]);
  const renderPinPost = useCallback(({item}: {item: TaskData}) => {
    return <PinPostItem pinPost={item} />;
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <View style={styles.titleWrap}>
          <ChannelIcon channel={currentChannel} color={colors.text} />
          <Text
            style={[styles.title, {color: colors.text}]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {currentChannel.channel_name}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <FlatList
          data={pinPosts}
          keyExtractor={item => item.task_id}
          renderItem={renderPinPost}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 42,
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  title: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 19,
    marginLeft: 10,
  },
  body: {
    flex: 1,
  },
});
export default memo(PinPostScreen);
