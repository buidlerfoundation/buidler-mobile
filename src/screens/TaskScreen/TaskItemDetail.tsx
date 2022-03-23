import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import BottomSheetHandle from 'components/BottomSheetHandle';
import ImageLightBox from 'components/ImageLightBox';
import RenderHTML from 'components/RenderHTML';
import Touchable from 'components/Touchable';
import ImageHelper from 'helpers/ImageHelper';
import {
  normalizeMessage,
  normalizeMessageText,
  normalizeUserName,
} from 'helpers/MessageHelper';
import {Channel, Message, Task, ThemeType, User} from 'models';
import React from 'react';
import {StyleSheet, View, FlatList, Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import MessageInput from 'screens/ConversationScreen/MessageInput';
import MessageItem from 'screens/ConversationScreen/MessageItem';
import themes from 'themes';
import {fromNow, isOverDate} from 'utils/DateUtils';

type TaskItemDetailProps = {
  themeType: ThemeType;
  task?: Task;
  onClose: () => void;
  teamUserData: Array<User>;
  teamId: string;
  conversations: Array<Message>;
  currentChannel: Channel;
  onUpdateStatus: (task: Task) => void;
  setCurrentChannel?: (channel: Channel) => any;
};

const TaskItemDetail = ({
  themeType,
  task,
  onClose,
  teamUserData,
  teamId,
  conversations,
  currentChannel,
  onUpdateStatus,
  setCurrentChannel,
}: TaskItemDetailProps) => {
  const {colors} = themes[themeType];
  if (!task)
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]} />
    );
  const creator = teamUserData?.find?.(u => u.user_id === task.creator);
  const onCheckPress = (task: Task) => () => {
    onUpdateStatus(task);
    onClose();
  };
  const renderStatusIcon = () => {
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
  };
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <BottomSheetHandle
        themeType={themeType}
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
                teamUserData={teamUserData}
                item={item}
                themeType={themeType}
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
                  setCurrentChannel={setCurrentChannel}
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
                      <FastImage
                        source={{uri: creator.avatar_url}}
                        style={styles.avatar}
                      />
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
          themeType={themeType}
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

export default TaskItemDetail;
