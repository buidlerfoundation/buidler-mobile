import {useNavigation} from '@react-navigation/native';
import {actionTypes} from 'actions/actionTypes';
import {getTasks} from 'actions/TaskActions';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import ChannelIcon from 'components/ChannelIcon';
import PinPostItem from 'components/PinPostItem';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useCurrentChannel from 'hook/useCurrentChannel';
import usePinPostData from 'hook/usePinPostData';
import usePinPosts from 'hook/usePinPosts';
import useThemeColor from 'hook/useThemeColor';
import {TaskData} from 'models';
import React, {memo, useCallback, useEffect} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {createLoadMoreSelector} from 'reducers/selectors';

const taskMoreSelector = createLoadMoreSelector([actionTypes.TASK_PREFIX]);

const PinPostScreen = () => {
  const dispatch = useAppDispatch();
  const pinPosts = usePinPosts();
  const navigation = useNavigation();
  const currentChannel = useCurrentChannel();
  const {colors} = useThemeColor();
  const loadMoreTask = useAppSelector(state => taskMoreSelector(state));
  const {canMoreTask} = usePinPostData();
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  useEffect(() => {
    dispatch(getTasks(currentChannel.channel_id));
  }, [currentChannel.channel_id, dispatch]);
  const renderPinPost = useCallback(({item}: {item: TaskData}) => {
    return <PinPostItem pinPost={item} />;
  }, []);
  const renderSeparator = useCallback(
    () => (
      <View style={[styles.ppSeparate, {backgroundColor: colors.border}]} />
    ),
    [colors.border],
  );
  const onEndReached = useCallback(() => {
    if (loadMoreTask || !canMoreTask) return;
    const last = pinPosts[pinPosts.length - 1];
    dispatch(getTasks(currentChannel.channel_id, last.message_created_at));
  }, [
    canMoreTask,
    currentChannel.channel_id,
    dispatch,
    loadMoreTask,
    pinPosts,
  ]);
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
          ItemSeparatorComponent={renderSeparator}
          ListHeaderComponent={<View style={{height: 20}} />}
          ListFooterComponent={
            <View style={{height: 30 + AppDimension.extraBottom}} />
          }
          onEndReachedThreshold={0.5}
          onEndReached={onEndReached}
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
  ppSeparate: {
    height: 1,
    marginVertical: 30,
  },
});
export default memo(PinPostScreen);
