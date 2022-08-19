import React, {memo, useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Collapsible from 'react-native-collapsible';
import Fonts from 'common/Fonts';
import {Channel, Space} from 'models';
import Touchable from 'components/Touchable';
import SVG from 'common/SVG';
import Emoji from 'react-native-emoji';
import FastImage from 'react-native-fast-image';
import ImageHelper from 'helpers/ImageHelper';
import useThemeColor from 'hook/useThemeColor';
import {useCallback} from 'react';
import ChannelItem from './ChannelItem';

type SpaceItemProps = {
  item: Space;
  currentChannel: Channel;
  teamId: string;
};

const SpaceItem = ({item, currentChannel, teamId}: SpaceItemProps) => {
  const {colors} = useThemeColor();
  const [isCollapsed, setCollapsed] = useState(false);
  const toggleCollapsed = useCallback(
    () => setCollapsed(current => !current),
    [],
  );
  const renderSpaceIcon = useCallback(() => {
    if (item.space_image_url) {
      return (
        <FastImage
          style={styles.logoSpace}
          src={ImageHelper.normalizeImage(item.space_image_url, teamId)}
          alt=""
        />
      );
    }
    if (item.space_emoji) {
      return <Emoji name={item.space_emoji} style={styles.emojiIcon} />;
    }
    return (
      <View style={styles.logoSpace}>
        <SVG.LogoDarkSquare width={30} height={30} />
      </View>
    );
  }, [item.space_emoji, item.space_image_url, teamId]);
  return (
    <View
      style={[
        styles.space,
        {
          backgroundColor: colors.background,
          borderColor: isCollapsed ? colors.border : colors.background,
        },
      ]}>
      <Touchable style={styles.groupHead} onPress={toggleCollapsed}>
        <View
          style={[styles.logoSpaceWrapper, {backgroundColor: colors.border}]}>
          {renderSpaceIcon()}
        </View>
        <Text style={[styles.groupName, {color: colors.text}]}>
          {item.space_name}
        </Text>
      </Touchable>
      <Collapsible collapsed={isCollapsed} duration={400} easing="linear">
        {item.channel_ids.map(channelId => {
          const isActive = currentChannel.channel_id === channelId;
          return (
            <ChannelItem
              channelId={channelId}
              isActive={isActive}
              key={channelId}
            />
          );
        })}
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  space: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  groupName: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 19,
  },
  emojiIcon: {fontSize: 20},
  logoSpace: {
    width: 30,
    height: 30,
    borderRadius: 8,
    overflow: 'hidden',
  },
  logoSpaceWrapper: {
    width: 30,
    height: 30,
    borderRadius: 8,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(SpaceItem);
