import AppStyles from 'common/AppStyles';
import ChannelIcon from 'components/ChannelIcon';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {Channel} from 'models';
import React, {memo, useCallback} from 'react';
import {StyleSheet, Text} from 'react-native';

type MentionChannelItemProps = {
  channel: Channel;
  onPress: (channel: Channel) => void;
};

const MentionChannelItem = ({channel, onPress}: MentionChannelItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(() => onPress(channel), [channel, onPress]);
  return (
    <Touchable style={styles.container} onPress={handlePress}>
      <ChannelIcon channel={channel} color={colors.subtext} />
      <Text
        style={[
          AppStyles.TextSemi16,
          {color: colors.subtext, marginLeft: 5, flex: 1},
        ]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {channel.channel_name}
      </Text>
      {!!channel.space?.space_name && (
        <Text style={[AppStyles.TextMed15, {color: colors.subtext}]}>
          {channel.space?.space_name}
        </Text>
      )}
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  logoSpaceWrapper: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
});

export default memo(MentionChannelItem);
