import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import RenderHTML from 'components/RenderHTML';
import Touchable from 'components/Touchable';
import {normalizeMessageTextPlain} from 'helpers/MessageHelper';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import useTeamUserData from 'hook/useTeamUserData';
import useThemeColor from 'hook/useThemeColor';
import {TaskData} from 'models';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import MessagePhoto from 'screens/ConversationScreen/MessagePhoto';
import {messageFromNow} from 'utils/DateUtils';

type PinPostItemProps = {pinPost: TaskData};

const PinPostItem = ({pinPost}: PinPostItemProps) => {
  const contentRef = useRef();
  const [isMore, setIsMore] = useState(false);
  const community = useCurrentCommunity();
  const teamUserData = useTeamUserData();
  const {colors} = useThemeColor();
  const creator = useMemo(
    () => teamUserData.find(el => el.user_id === pinPost.message_sender_id),
    [pinPost.message_sender_id, teamUserData],
  );
  const isIPFS = useMemo(() => !!pinPost.cid, [pinPost.cid]);
  const onContentLayout = useCallback(() => {
    contentRef.current.measure((ox, oy, w, h) => {
      setIsMore(h > 130);
    });
  }, []);
  const onPinPostPress = useCallback(() => {}, []);
  return (
    <Touchable style={styles.container} onPress={onPinPostPress}>
      <View style={styles.header}>
        <AvatarView user={creator} size={20} />
        <View style={styles.userNameWrap}>
          <Text
            style={[styles.userName, {color: colors.text}]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {creator.user_name}
          </Text>
          <Text style={[styles.createdAt, {color: colors.subtext}]}>
            {messageFromNow(pinPost.message_created_at)}
          </Text>
        </View>
        {isIPFS && <SVG.IconIPFSLock fill={colors.mention} />}
      </View>
      {!!pinPost.content && (
        <View
          ref={contentRef}
          style={styles.content}
          onLayout={onContentLayout}>
          <RenderHTML
            html={normalizeMessageTextPlain(pinPost.content)}
            pinPostItem
          />
          {isMore && (
            <Text style={[styles.viewMore, {color: colors.subtext}]}>
              View more
            </Text>
          )}
        </View>
      )}
      {pinPost.task_attachments.length > 0 && (
        <View style={styles.attachmentWrap}>
          <MessagePhoto
            attachments={pinPost.task_attachments}
            teamId={community.team_id}
          />
        </View>
      )}
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {paddingHorizontal: 20},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 10,
  },
  userName: {
    marginRight: 8,
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 26,
  },
  createdAt: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: Fonts.Medium,
  },
  content: {
    marginTop: 8,
  },
  attachmentWrap: {
    marginTop: 5,
  },
  viewMore: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
  },
});

export default memo(PinPostItem);
