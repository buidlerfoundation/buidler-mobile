import {Channel, Message, ThemeType, User} from 'models';
import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import themes from 'themes';
import FastImage from 'react-native-fast-image';
import Fonts from 'common/Fonts';
import MessagePhoto from './MessagePhoto';
import MessageReply from './MessageReply';
import RenderHTML from 'components/RenderHTML';
import {normalizeMessageText, normalizeUserName} from 'helpers/MessageHelper';
import {messageFromNow} from 'utils/DateUtils';
import ImageHelper from 'helpers/ImageHelper';
import Blockies from 'components/Blockies';

type MessageReplyItemProps = {
  item: Message;
  themeType: ThemeType;
  teamUserData: Array<User>;
  teamId: string;
  setCurrentChannel?: (channel: Channel) => any;
};

const MessageReplyItem = ({
  item,
  teamUserData,
  themeType,
  teamId,
  setCurrentChannel,
}: MessageReplyItemProps) => {
  const {isConversationHead, isHead} = item;
  const head = isConversationHead || isHead;
  const sender = teamUserData?.find?.(u => u.user_id === item.sender_id);
  if (!sender) return null;
  const {colors} = themes[themeType];
  const data = ImageHelper.normalizeAvatar(sender?.avatar_url, sender?.user_id);
  const Avatar =
    typeof data === 'string' ? (
      <FastImage
        source={{
          uri: data,
        }}
        style={styles.avatar}
      />
    ) : (
      <Blockies blockies={data.address} size={8} style={styles.avatar} />
    );
  return (
    <View style={[styles.container, {marginTop: head ? 20 : 0}]}>
      {head ? Avatar : <View style={{width: 35}} />}
      <View style={styles.bodyMessage}>
        {head && (
          <View style={styles.nameWrapper}>
            <Text style={[styles.senderName, {color: colors.text}]}>
              {normalizeUserName(sender.user_name)}
            </Text>
            <Text style={[styles.messageDate, {color: colors.secondary}]}>
              {messageFromNow(item.createdAt)}
            </Text>
          </View>
        )}
        {head && (
          <MessageReply
            themeType={themeType}
            teamUserData={teamUserData}
            message={item}
            setCurrentChannel={setCurrentChannel}
          />
        )}
        {(!!item.content && (
          <RenderHTML
            html={`<div class='message-text'>${normalizeMessageText(
              item.content,
            )}</div>`}
            setCurrentChannel={setCurrentChannel}
          />
        )) || <View style={{height: 8}} />}
        <MessagePhoto
          attachments={item?.message_attachment || []}
          teamId={teamId}
          themeType={themeType}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  bodyMessage: {
    marginLeft: 15,
    flex: 1,
  },
  nameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageDate: {
    fontSize: 11,
    fontFamily: Fonts.Medium,
    marginLeft: 5,
    lineHeight: 20,
    textAlign: 'center',
  },
  senderName: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: Fonts.SemiBold,
  },
  message: {
    fontFamily: Fonts.Medium,
    fontSize: 16,
    lineHeight: 26,
    marginTop: 8,
  },
});

export default MessageReplyItem;
