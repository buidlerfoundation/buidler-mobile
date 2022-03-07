import actions from 'actions';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {groupTaskByFiltered} from 'helpers/TaskHelper';
import {
  Channel,
  GroupChannel,
  Message,
  ReactData,
  Task,
  Team,
  ThemeType,
  User,
} from 'models';
import React, {useEffect, useState} from 'react';
import {Image, View, Text, StyleSheet, SectionList} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import themes from 'themes';
import CreateTaskLayer from './CreateTaskLayer';
import TaskItem from './TaskItem';
import Modal from 'react-native-modal';
import TaskItemDetail from './TaskItemDetail';
import FastImage from 'react-native-fast-image';
import HapticUtils from 'utils/HapticUtils';

type TaskScreenProps = {
  themeType: ThemeType;
  currentChannel: Channel;
  getArchivedTasks: (
    channelId: string,
    userId?: string,
    teamId?: string,
  ) => any;
  getTasks: (channelId: string) => any;
  getTaskFromUser: (userId: string, channelId: string, teamId: string) => any;
  tasks: Array<Task>;
  archivedTasks: Array<Task>;
  currentTeam: Team;
  reactData: {[key: string]: Array<ReactData>};
  channels: Array<Channel>;
  teamUserData: Array<User>;
  createTask: (channelId: string, body: any) => any;
  updateTask: (taskId: string, channelId: string, data: any) => any;
  getConversations: (
    parentId: string,
    before?: string,
    isFresh?: boolean,
  ) => any;
  conversationData: {[key: string]: Array<Message>};
  groupChannel: Array<GroupChannel>;
  route?: any;
  navigation?: any;
  setCurrentChannel?: (channel: Channel) => any;
  archivedCount?: number;
};

const TaskScreen = ({
  themeType,
  currentChannel,
  getTasks,
  getTaskFromUser,
  getArchivedTasks,
  tasks,
  currentTeam,
  reactData,
  channels,
  teamUserData,
  createTask,
  updateTask,
  conversationData,
  getConversations,
  groupChannel,
  route,
  navigation,
  setCurrentChannel,
  archivedTasks,
  archivedCount,
}: TaskScreenProps) => {
  const [selectedTask, setSelectedTask] = useState<Task>(null);
  const [isOpen, setOpen] = useState(false);
  const {colors} = themes[themeType];
  const {taskId} = route?.params || {};
  useEffect(() => {
    if (taskId && tasks) {
      const t = tasks.find(el => el.task_id === taskId);
      if (t) {
        getConversations(taskId);
        setSelectedTask(t);
        navigation.setParams({taskId: null});
      }
    }
  }, [taskId, tasks]);
  useEffect(() => {
    if (currentChannel.user) {
      getTaskFromUser(
        currentChannel.user.user_id,
        currentChannel.channel_id || currentChannel.user.user_id,
        currentTeam?.team_id,
      );
    } else {
      getTasks(currentChannel.channel_id);
    }
  }, [currentChannel, currentTeam?.team_id]);
  const toggleCreateTask = () => setOpen(!isOpen);
  const [taskMapped, setTaskMapped] = useState<
    Array<{title: string; data: Array<Task>; show: boolean}>
  >([]);
  useEffect(() => {
    if (tasks != null) {
      const taskGrouped = groupTaskByFiltered('Status', tasks);
      const prevArchived = taskMapped?.find(el => el.title === 'archived');
      setTaskMapped([
        ...Object.keys(taskGrouped).map(k => {
          const prev = taskMapped?.find(el => el.title === k);
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
      ]);
    }
  }, [tasks, archivedTasks]);
  const onUpdateStatus = (task: Task) => {
    if (!currentChannel?.channel_id) return;
    updateTask(task.task_id, currentChannel?.channel_id, {
      status: task.status !== 'done' ? 'done' : 'todo',
    });
  };
  const onCloseTask = () => setSelectedTask(null);
  const onTitlePress = (title: string) => () => {
    setTaskMapped(taskMap =>
      taskMap.map(el => {
        if (el.title === title) {
          el.show = !el.show;
        }
        return el;
      }),
    );
    getArchivedTasks(
      currentChannel.channel_id,
      currentChannel?.user?.user_id,
      currentTeam?.team_id,
    );
  };
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
            <FastImage
              style={{width: 32, height: 32, borderRadius: 16}}
              source={{uri: currentChannel.user?.avatar_url}}
            />
            <Text style={[styles.title, {color: colors.text}]}>
              {currentChannel.user?.full_name}
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
          keyExtractor={(item, index) => item.task_id}
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
                themeType={themeType}
                teamId={currentTeam.team_id}
                reacts={reactData[item.task_id]}
                onUpdateStatus={onUpdateStatus}
                onPressTask={() => {
                  getConversations(item.task_id);
                  setSelectedTask(item);
                }}
                setCurrentChannel={setCurrentChannel}
              />
            );
          }}
          renderSectionHeader={({section: {title, show, data}}) => {
            const colorTitle: any = {
              todo: colors.todo,
              doing: colors.doing,
              done: colors.done,
              archived: colors.subtext,
            };
            return (
              <View
                style={{
                  paddingHorizontal: 20,
                  backgroundColor: colors.background,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Touchable
                  style={[
                    styles.titleWrapper,
                    {backgroundColor: colors.activeBackgroundLight},
                  ]}
                  onPress={onTitlePress(title)}>
                  <Text style={[styles.titleText, {color: colorTitle[title]}]}>
                    {title}
                  </Text>
                </Touchable>
                {!show && (
                  <Touchable
                    style={[
                      styles.taskCountWrapper,
                      {backgroundColor: colors.activeBackgroundLight},
                    ]}
                    onPress={onTitlePress(title)}>
                    <Text
                      style={[styles.taskCountText, {color: colors.subtext}]}>
                      {title === 'archived'
                        ? archivedTasks.length || archivedCount
                        : data.length}
                    </Text>
                  </Touchable>
                )}
              </View>
            );
          }}
        />
      </View>
      <Touchable
        style={styles.createButton}
        onPress={() => {
          HapticUtils.trigger();
          toggleCreateTask();
        }}
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
          themeType={themeType}
          currentChannel={currentChannel}
          channels={channels}
          teamUserData={teamUserData}
          currentTeam={currentTeam}
          createTask={createTask}
          groupChannel={groupChannel}
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
          themeType={themeType}
          onClose={onCloseTask}
          teamUserData={teamUserData}
          teamId={currentTeam.team_id}
          conversations={conversationData?.[selectedTask?.task_id] || []}
          currentChannel={currentChannel}
          onUpdateStatus={onUpdateStatus}
          setCurrentChannel={setCurrentChannel}
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
  titleText: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
    textTransform: 'capitalize',
  },
  titleWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    alignSelf: 'flex-start',
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
  taskCountWrapper: {
    height: 30,
    minWidth: 18,
    borderRadius: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCountText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },
});

const mapPropsToState = (state: any) => {
  const channelId = state.user?.currentChannel?.channel_id;
  return {
    themeType: state.configs.theme,
    tasks: channelId ? state.task.taskData?.[channelId]?.tasks || [] : [],
    archivedTasks: channelId
      ? state.task.taskData?.[channelId]?.archivedTasks || []
      : [],
    archivedCount: channelId
      ? state.task.taskData?.[channelId]?.archivedCount || null
      : null,
    currentChannel: state.user.currentChannel,
    currentTeam: state.user.currentTeam,
    reactData: state.reactReducer.reactData,
    channels: state.user.channel,
    teamUserData: state.user.teamUserData,
    conversationData: state.message.conversationData,
    groupChannel: state.user.groupChannel,
  };
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapPropsToState, mapActionsToProps)(TaskScreen);
