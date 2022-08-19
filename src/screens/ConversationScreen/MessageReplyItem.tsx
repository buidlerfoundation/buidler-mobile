import {MessageData, UserData} from 'models';
import React, {useMemo, useCallback, memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import Fonts from 'common/Fonts';
import MessagePhoto from './MessagePhoto';
import RenderHTML from 'components/RenderHTML';
import {normalizeMessageText, normalizeUserName} from 'helpers/MessageHelper';
import {messageFromNow} from 'utils/DateUtils';
import ImageHelper from 'helpers/ImageHelper';
import Blockies from 'components/Blockies';
import useThemeColor from 'hook/useThemeColor';
import Touchable from 'components/Touchable';

type MessageReplyItemProps = {
  item: MessageData;
  sender: UserData;
  teamId: string;
  onLongPress: (message: MessageData) => void;
};

const MessageReplyItem = ({
  item,
  sender,
  teamId,
  onLongPress,
}: MessageReplyItemProps) => {
  console.log('Render Message');
  const {isConversationHead, isHead} = item;
  const head = isConversationHead || isHead;
  const {colors} = useThemeColor();
  const data = useMemo(
    () => ImageHelper.normalizeAvatar(sender?.avatar_url, sender?.user_id),
    [sender?.avatar_url, sender?.user_id],
  );
  const Avatar = useMemo(
    () =>
      typeof data === 'string' ? (
        <FastImage
          source={{
            uri: data,
          }}
          style={styles.avatar}
        />
      ) : (
        <Blockies blockies={data.address} size={8} style={styles.avatar} />
      ),
    [data],
  );
  const handleLongPress = useCallback(
    () => onLongPress(item),
    [item, onLongPress],
  );
  if (!sender) return null;
  return (
    <Touchable
      style={[styles.container, {marginTop: head ? 20 : 0}]}
      onLongPress={handleLongPress}>
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
        {/* {head && <MessageReply message={item} />} */}
        {(!!item.content && (
          <RenderHTML
            html={`<div class='message-text'>${normalizeMessageText(
              item.content,
            )}</div>`}
          />
        )) || <View style={{height: 8}} />}
        <MessagePhoto
          attachments={item?.message_attachment || []}
          teamId={teamId}
        />
      </View>
    </Touchable>
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

export default memo(MessageReplyItem);
