import {MessageData, UserData} from 'models';
import React, {useCallback, memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Fonts from 'common/Fonts';
import MessagePhoto from './MessagePhoto';
import RenderHTML from 'components/RenderHTML';
import {normalizeMessageText, normalizeUserName} from 'helpers/MessageHelper';
import {messageFromNow} from 'utils/DateUtils';
import useThemeColor from 'hook/useThemeColor';
import Touchable from 'components/Touchable';
import AvatarView from 'components/AvatarView';

type MessageItemProps = {
  item: MessageData;
  teamId: string;
  sender: UserData;
  onLongPress?: (message: MessageData) => void;
};

const MessageItem = ({item, sender, teamId, onLongPress}: MessageItemProps) => {
  const {colors} = useThemeColor();
  const handleLongPress = useCallback(
    () => onLongPress?.(item),
    [item, onLongPress],
  );
  if (!sender) return null;
  return (
    <Touchable
      style={[styles.container, {marginTop: item.isHead ? 20 : 0}]}
      onLongPress={handleLongPress}>
      {item.isHead ? (
        <AvatarView user={sender} size={35} />
      ) : (
        <View style={{width: 35}} />
      )}
      <View style={styles.bodyMessage}>
        {item.isHead && (
          <View style={styles.nameWrapper}>
            <Text style={[styles.senderName, {color: colors.text}]}>
              {normalizeUserName(sender.user_name)}
            </Text>
            <Text style={[styles.messageDate, {color: colors.secondary}]}>
              {messageFromNow(item.createdAt)}
            </Text>
          </View>
        )}
        {(!!item.content && (
          <RenderHTML html={normalizeMessageText(item.content)} />
        )) || <View style={{height: 8}} />}
        <MessagePhoto
          attachments={item?.message_attachments || []}
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

export default memo(MessageItem);
