import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import RenderHTML from 'components/RenderHTML';
import {normalizeMessageTextPlain} from 'helpers/MessageHelper';
import useTeamUserData from 'hook/useTeamUserData';
import useThemeColor from 'hook/useThemeColor';
import {TaskData} from 'models';
import React, {memo, useMemo} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {messageFromNow} from 'utils/DateUtils';

type PinPostItemProps = {pinPost: TaskData};

const PinPostItem = ({pinPost}: PinPostItemProps) => {
  const teamUserData = useTeamUserData();
  const {colors} = useThemeColor();
  const creator = useMemo(
    () => teamUserData.find(el => el.user_id === pinPost.message_sender_id),
    [pinPost.message_sender_id, teamUserData],
  );
  const isIPFS = useMemo(() => !!pinPost.cid, [pinPost.cid]);
  return (
    <View style={styles.container}>
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
      <View style={styles.content}>
        <RenderHTML html={normalizeMessageTextPlain(pinPost.content)} />
      </View>
    </View>
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
});

export default memo(PinPostItem);
