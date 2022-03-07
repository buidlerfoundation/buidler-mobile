import {Channel, Message, ThemeType, User} from 'models';
import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import themes from 'themes';
import FastImage from 'react-native-fast-image';
import Fonts from 'common/Fonts';
import Touchable from 'components/Touchable';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';
import RenderHTML from 'components/RenderHTML';
import {normalizeMessageText} from 'helpers/MessageHelper';

type MessageReplyProps = {
  themeType: ThemeType;
  message: Message;
  teamUserData: Array<User>;
  setCurrentChannel?: (channel: Channel) => any;
};

const MessageReply = ({
  themeType,
  message,
  teamUserData,
  setCurrentChannel,
}: MessageReplyProps) => {
  const {colors} = themes[themeType];
  const msgHead =
    message.conversation_data[message.conversation_data.length - 1];
  const senderHead = teamUserData?.find?.(u => u.user_id === msgHead.sender_id);
  if (!senderHead) return null;
  return (
    <View style={styles.container}>
      <View style={[styles.indicator, {backgroundColor: colors.subtext}]} />
      {message.task ? (
        <Touchable
          style={{paddingHorizontal: 10}}
          onPress={() => {
            NavigationServices.pushToScreen(ScreenID.TaskScreen, {
              taskId: message.task?.task_id,
            });
          }}>
          <Text
            style={{
              color: colors.mention,
              fontSize: 16,
              fontFamily: Fonts.SemiBold,
              lineHeight: 19,
            }}>
            View task
          </Text>
        </Touchable>
      ) : (
        <View style={{paddingHorizontal: 10}}>
          <Text
            style={{
              color: colors.mention,
              fontSize: 16,
              fontFamily: Fonts.SemiBold,
              lineHeight: 19,
            }}>
            {message.conversation_data.length - 1} Replies
          </Text>
          {/* {message.message_id !== message.parent_id && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
                flex: 1,
              }}>
              <FastImage
                source={{uri: senderHead.avatar_url}}
                style={styles.avatar}
              />
              <RenderHTML
                html={`<div class='message-reply-text'>${normalizeMessageText(
                  msgHead.content || 'Attachment',
                )}</div>`}
                setCurrentChannel={setCurrentChannel}
              />
            </View>
          )} */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  indicator: {
    width: 4,
    height: '100%',
    borderRadius: 5,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
});

export default MessageReply;
