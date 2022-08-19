import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {groupTaskByFiltered} from 'helpers/TaskHelper';
import {TaskData} from 'models';
import React, {memo, useEffect, useState} from 'react';
import {Image, View, Text, StyleSheet, SectionList} from 'react-native';
import CreateTaskLayer from './CreateTaskLayer';
import TaskItem from './TaskItem';
import Modal from 'react-native-modal';
import TaskItemDetail from './TaskItemDetail';
import FastImage from 'react-native-fast-image';
import HapticUtils from 'utils/HapticUtils';
import {normalizeUserName} from 'helpers/MessageHelper';
import ImageHelper from 'helpers/ImageHelper';
import Blockies from 'components/Blockies';
import useThemeColor from 'hook/useThemeColor';
import useCurrentChannel from 'hook/useCurrentChannel';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useMemo} from 'react';
import useTaskData from 'hook/useTaskData';
import useAppDispatch from 'hook/useAppDispatch';
import {getConversations} from 'actions/MessageActions';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import {getArchivedTasks, getTasks, updateTask} from 'actions/TaskActions';
import useChannel from 'hook/useChannel';
import useTeamUserData from 'hook/useTeamUserData';
import useAppSelector from 'hook/useAppSelector';
import useSpaceChannel from 'hook/useSpaceChannel';
import {useCallback} from 'react';
import TitleItem from './TitleItem';

const TaskScreen = () => {
  const dispatch = useAppDispatch();
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [isOpen, setOpen] = useState(false);
  const {colors} = useThemeColor();
  const channels = useChannel();
  const teamUserData = useTeamUserData();
  const currentChannel = useCurrentChannel();
  const currentTeam = useCurrentCommunity();
  const route = useRoute();
  const navigation = useNavigation();
  const reactData = useAppSelector(state => state.reactReducer.reactData);
  const conversationData = useAppSelector(
    state => state.message.conversationData,
  );
  const spaceChannel = useSpaceChannel();
  const taskId = useMemo(() => route.params?.taskId, [route.params?.taskId]);
  const taskData = useTaskData();
  const tasks = useMemo(() => taskData?.tasks || [], [taskData?.tasks]);
  const archivedCount = useMemo(
    () => taskData?.archivedCount,
    [taskData?.archivedCount],
  );
  const archivedTasks = useMemo(
    () => taskData?.archivedTasks || [],
    [taskData?.archivedTasks],
  );
  useEffect(() => {
    if (taskId && tasks) {
      const t = tasks.find(el => el.task_id === taskId);
      if (t) {
        dispatch(getConversations(taskId));
        setSelectedTask(t);
        navigation.setParams({taskId: null});
      }
    }
  }, [dispatch, navigation, taskId, tasks]);
  useEffect(() => {
    dispatch(getTasks(currentChannel.channel_id));
  }, [currentChannel.channel_id, dispatch]);
  const toggleCreateTask = useCallback(() => setOpen(current => !current), []);
  const [taskMapped, setTaskMapped] = useState<
    Array<{title: string; data: Array<TaskData>; show: boolean}>
  >([]);
  useEffect(() => {
    if (tasks != null) {
      const taskGrouped = groupTaskByFiltered('Status', tasks);
      setTaskMapped(current => {
        const prevArchived = current?.find(el => el.title === 'archived');
        return [
          ...Object.keys(taskGrouped).map(k => {
            const prev = current?.find(el => el.title === k);
            return {
              title: k,
              data: taskGrouped[k],
              show: prev ? prev.show : true,
            };
          }),
          {
            title: 'archived',
            data: archivedTasks,
            show: prevArchived ? prevArchived.show : false,
          },
        ];
      });
    }
  }, [tasks, archivedTasks]);
  const onUpdateStatus = useCallback(
    (task: TaskData) => {
      if (!currentChannel?.channel_id) return;
      dispatch(
        updateTask(task.task_id, currentChannel?.channel_id, {
          status: task.status !== 'done' ? 'done' : 'todo',
        }),
      );
    },
    [currentChannel?.channel_id, dispatch],
  );
  const onPressTask = useCallback(
    (item: TaskData) => {
      dispatch(getConversations(item.task_id));
      setSelectedTask(item);
    },
    [dispatch],
  );
  const onCloseTask = useCallback(() => setSelectedTask(null), []);
  const onTitlePress = useCallback(
    (title: string) => {
      setTaskMapped(taskMap =>
        taskMap.map(el => {
          if (el.title === title) {
            el.show = !el.show;
          }
          return el;
        }),
      );
      dispatch(
        getArchivedTasks(
          currentChannel.channel_id,
          currentChannel?.user?.user_id,
          currentTeam?.team_id,
        ),
      );
    },
    [
      currentChannel.channel_id,
      currentChannel?.user?.user_id,
      currentTeam?.team_id,
      dispatch,
    ],
  );
  const handleCreateTask = useCallback(() => {
    HapticUtils.trigger();
    toggleCreateTask();
  }, [toggleCreateTask]);
  const data = useMemo(
    () =>
      ImageHelper.normalizeAvatar(
        currentChannel?.user?.avatar_url,
        currentChannel?.user?.user_id,
      ),
    [currentChannel?.user?.avatar_url, currentChannel?.user?.user_id],
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {currentChannel.user ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 5,
            }}>
            {typeof data === 'string' ? (
              <FastImage
                style={{width: 32, height: 32, borderRadius: 16}}
                source={{
                  uri: data,
                }}
              />
            ) : (
              <Blockies
                blockies={data.address}
                size={8}
                style={{width: 32, height: 32, borderRadius: 16}}
              />
            )}
            <Text style={[styles.title, {color: colors.text}]}>
              {normalizeUserName(currentChannel.user?.user_name)}
            </Text>
          </View>
        ) : (
          <Text style={[styles.title, {color: colors.text}]}>
            {currentChannel.channel_type === 'Private' ? (
              <Image source={require('assets/images/ic_private.png')} />
            ) : (
              '#'
            )}{' '}
            {currentChannel.channel_name}
          </Text>
        )}
        <Touchable
          style={{
            padding: 10,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <SVG.IconMore fill={colors.text} />
        </Touchable>
      </View>
      <View style={styles.body}>
        <SectionList
          sections={taskMapped}
          keyExtractor={item => item.task_id}
          ListFooterComponent={
            <View style={{paddingBottom: AppDimension.extraBottom + 26}} />
          }
          renderItem={({item, section}) => {
            if (!section.show) {
              return <View />;
            }
            return (
              <TaskItem
                task={item}
                teamId={currentTeam.team_id}
                reacts={reactData[item.task_id]}
                onUpdateStatus={onUpdateStatus}
                onPressTask={onPressTask}
              />
            );
          }}
          renderSectionHeader={({section}) => {
            return (
              <TitleItem
                archivedCount={archivedTasks.length || archivedCount}
                section={section}
                onTitlePress={onTitlePress}
              />
            );
          }}
        />
      </View>
      <Touchable
        style={styles.createButton}
        onPress={handleCreateTask}
        activeOpacity={1}>
        <SVG.IconCreateTask />
      </Touchable>
      <Modal
        isVisible={isOpen}
        style={styles.modalCreateTask}
        avoidKeyboard
        onMoveShouldSetResponderCapture={() => false}
        backdropColor={colors.backdrop}
        backdropOpacity={0.9}>
        <CreateTaskLayer
          isOpen={isOpen}
          toggle={toggleCreateTask}
          currentChannel={currentChannel}
          channels={channels}
          teamUserData={teamUserData}
          currentTeam={currentTeam}
          spaceChannel={spaceChannel}
        />
      </Modal>
      <Modal
        isVisible={!!selectedTask}
        style={styles.modalCreateTask}
        avoidKeyboard
        onMoveShouldSetResponderCapture={() => false}
        backdropColor={colors.backdrop}
        backdropOpacity={0.9}
        swipeDirection={['down']}
        onSwipeComplete={onCloseTask}
        onBackdropPress={onCloseTask}>
        <TaskItemDetail
          task={selectedTask}
          onClose={onCloseTask}
          teamUserData={teamUserData}
          teamId={currentTeam.team_id}
          conversations={conversationData?.[selectedTask?.task_id] || []}
          currentChannel={currentChannel}
          onUpdateStatus={onUpdateStatus}
        />
      </Modal>
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
    paddingHorizontal: 10,
    paddingVertical: 14,
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
  createButton: {
    position: 'absolute',
    right: 15,
    bottom: 15 + AppDimension.extraBottom,
  },
  modalCreateTask: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});
export default memo(TaskScreen);
