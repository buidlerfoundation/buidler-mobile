import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import BottomSheetHandle from 'components/BottomSheetHandle';
import RenderHTML from 'components/RenderHTML';
import Touchable from 'components/Touchable';
import ImageHelper from 'helpers/ImageHelper';
import {
  normalizeMessage,
  normalizeMessageText,
  normalizeUserName,
} from 'helpers/MessageHelper';
import {Channel, MessageData, TaskData, UserData} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, View, FlatList, Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import MessageInput from 'screens/ConversationScreen/MessageInput';
import MessageItem from 'screens/ConversationScreen/MessageItem';
import {fromNow, isOverDate} from 'utils/DateUtils';
import Blockies from 'components/Blockies';
import useThemeColor from 'hook/useThemeColor';

type TaskItemDetailProps = {
  task?: TaskData;
  onClose: () => void;
  teamUserData: Array<UserData>;
  teamId: string;
  conversations: Array<MessageData>;
  currentChannel: Channel;
  onUpdateStatus: (task: TaskData) => void;
};

const TaskItemDetail = ({
  task,
  onClose,
  teamUserData,
  teamId,
  conversations,
  currentChannel,
  onUpdateStatus,
}: TaskItemDetailProps) => {
  const {colors} = useThemeColor();
  const creator = useMemo(
    () => teamUserData?.find?.(u => u.user_id === task?.creator),
    [task?.creator, teamUserData],
  );
  const onCheckPress = useCallback(
    (task: TaskData) => () => {
      onUpdateStatus(task);
      onClose();
    },
    [onClose, onUpdateStatus],
  );
  const renderStatusIcon = useCallback(() => {
    if (task.status === 'todo') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress(task)}>
          <SVG.IconCheckOutLine stroke={colors.subtext} />
        </Touchable>
      );
    }
    if (task.status === 'doing') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress(task)}>
          <SVG.IconCheckDoing />
        </Touchable>
      );
    }
    if (task.status === 'done') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress(task)}>
          <SVG.IconCheckDone />
        </Touchable>
      );
    }
  }, [colors.subtext, onCheckPress, task]);
  const data = useMemo(
    () => ImageHelper.normalizeAvatar(creator?.avatar_url, creator?.user_id),
    [creator?.avatar_url, creator?.user_id],
  );
  if (!task)
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]} />
    );
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <BottomSheetHandle
        onClosePress={onClose}
        titleComponent={
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {renderStatusIcon()}
            <Text
              style={{
                fontSize: 20,
                fontFamily: Fonts.Bold,
                lineHeight: 24,
                color: colors.text,
                marginLeft: 5,
              }}>
              {task.status}
            </Text>
          </View>
        }
      />
      <View style={{flex: 1}}>
        <FlatList
          data={normalizeMessage(conversations.slice(0, -1)).reverse()}
          keyExtractor={item => item.message_id}
          renderItem={({item}) => (
            <Touchable activeOpacity={1}>
              <MessageItem
                teamId={teamId}
                item={item}
                sender={teamUserData.find(el => el.user_id === item.sender_id)}
              />
            </Touchable>
          )}
          ListFooterComponent={<View style={{height: 24}} />}
          ListHeaderComponent={
            <Touchable activeOpacity={1}>
              <View style={styles.taskInfo}>
                <RenderHTML
                  html={`<div class='task-text' style='margin-top: 10px;'>${normalizeMessageText(
                    task.title,
                  )}</div>`}
                  onLinkPress={onClose}
                />
                {!!task.notes && (
                  <Text
                    style={[styles.text, {color: colors.text, marginTop: 20}]}>
                    {task.notes}
                  </Text>
                )}
                <View style={[styles.row, {marginTop: 20}]}>
                  <Text style={[styles.label, {color: colors.subtext}]}>
                    Channels
                  </Text>
                  <View style={styles.channelView}>
                    {task.channel.map(c => (
                      <View
                        style={[
                          styles.channelItem,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.activeBackgroundLight,
                          },
                        ]}
                        key={c.channel_id}>
                        <Text
                          style={[styles.channelName, {color: colors.text}]}>
                          # {c.channel_name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={[styles.row, {marginTop: 20}]}>
                  <Text style={[styles.label, {color: colors.subtext}]}>
                    Members
                  </Text>
                  {creator && (
                    <View style={styles.memberView}>
                      {typeof data === 'string' ? (
                        <FastImage
                          source={{
                            uri: data,
                          }}
                          style={styles.avatar}
                        />
                      ) : (
                        <Blockies
                          blockies={data.address}
                          size={8}
                          style={styles.avatar}
                        />
                      )}
                      <Text
                        style={[
                          styles.channelName,
                          {color: colors.text, marginLeft: 15},
                        ]}>
                        {normalizeUserName(creator.user_name)}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={[styles.row, {marginTop: 20}]}>
                  <Text style={[styles.label, {color: colors.subtext}]}>
                    Due Date
                  </Text>
                  <View style={styles.dueDateView}>
                    {task.due_date && (
                      <Text
                        style={[
                          styles.channelName,
                          {
                            color: isOverDate(task.due_date)
                              ? colors.urgent
                              : colors.text,
                          },
                        ]}>
                        {fromNow(task.due_date)}
                      </Text>
                    )}
                  </View>
                </View>
                <Text
                  style={[
                    styles.label,
                    {color: colors.subtext, marginTop: 24},
                  ]}>
                  Files
                </Text>
                {task.task_attachment.length > 0 && (
                  <View style={styles.attachmentView}>
                    {task.task_attachment.map(attachment => {
                      return (
                        <View
                          style={{marginTop: 10, marginRight: 10}}
                          key={attachment.file_id}>
                          <FastImage
                            source={{
                              uri: ImageHelper.normalizeImage(
                                attachment.file_url,
                                teamId,
                                {
                                  h: 90,
                                },
                              ),
                            }}
                            style={{borderRadius: 5, width: 150, height: 90}}
                            resizeMode="cover"
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
                <Text
                  style={[
                    styles.label,
                    {color: colors.subtext, marginTop: 24},
                  ]}>
                  Conversations
                </Text>
              </View>
            </Touchable>
          }
        />
      </View>
      <View style={styles.bottomView}>
        <MessageInput
          currentChannel={currentChannel}
          parentId={task.task_id}
          placeholder="Add comment"
          teamId={teamId}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '90%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  taskInfo: {
    paddingHorizontal: 20,
  },
  text: {
    fontFamily: Fonts.Medium,
    fontSize: 16,
    lineHeight: 19,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    flex: 1,
    fontFamily: Fonts.Medium,
    fontSize: 16,
    lineHeight: 19,
    marginTop: 4,
  },
  channelView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 2,
  },
  memberView: {
    flex: 2,
    flexDirection: 'row',
    marginTop: 4,
  },
  channelItem: {
    marginRight: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
  },
  channelName: {
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    lineHeight: 19,
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  dueDateView: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  attachmentView: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  bottomView: {},
});

export default memo(TaskItemDetail);
