import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Space} from 'models';
import useThemeColor from 'hook/useThemeColor';
import SpaceIcon from 'components/SpaceIcon';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import ChannelItem from './ChannelItem';
import useCurrentChannel from 'hook/useCurrentChannel';
import useChannel from 'hook/useChannel';
import AppStyles from 'common/AppStyles';
import {useNavigation} from '@react-navigation/native';
import ScreenID from 'common/ScreenID';
import {updateSpaceToggle} from 'actions/SideBarActions';
import useSpaceCollapsed from 'hook/useSpaceCollapsed';

type SpaceItemProps = {
  item: Space;
  isOwner?: boolean;
  onCreateChannel: () => void;
};

const SpaceItem = ({item, isOwner, onCreateChannel}: SpaceItemProps) => {
  const navigation = useNavigation();
  const isCollapsed = useSpaceCollapsed(item.space_id);
  const currentChannel = useCurrentChannel();
  const channel = useChannel();
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const toggleSpace = useCallback(() => {
    dispatch(updateSpaceToggle(item.space_id, isCollapsed));
  }, [dispatch, isCollapsed, item.space_id]);
  const onBadgePress = useCallback(() => {
    navigation.navigate(ScreenID.SpaceDetailScreen, {space: item});
  }, [item, navigation]);
  const handleSpacePress = useCallback(() => {
    if (item.is_space_member) {
      toggleSpace();
    } else {
      onBadgePress();
    }
  }, [item.is_space_member, onBadgePress, toggleSpace]);
  const channelData = useMemo(() => {
    return item.channel_ids
      ?.map(el => channel.find(c => c.channel_id === el))
      ?.filter(el => {
        if (isCollapsed)
          return (
            !!el &&
            ((!el.seen && el.notification_type !== 'Muted') ||
              el.channel_id === currentChannel.channel_id)
          );
        return !!el;
      });
  }, [channel, currentChannel.channel_id, isCollapsed, item.channel_ids]);
  return (
    <View
      style={[
        styles.space,
        {
          backgroundColor: colors.background,
          borderColor: isCollapsed ? colors.background : colors.border,
        },
      ]}>
      <Touchable style={styles.groupHead} onPress={handleSpacePress}>
        <View
          style={[
            styles.logoSpaceWrapper,
            !item.space_image_url && {backgroundColor: colors.border},
          ]}>
          <SpaceIcon space={item} />
        </View>
        <Text
          style={[
            styles.groupName,
            AppStyles.TextSemi15,
            {color: isCollapsed ? colors.subtext : colors.text},
          ]}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {item.space_name}
        </Text>
        {item.space_type === 'Private' && (
          <Touchable style={styles.badgeWrapper} onPress={onBadgePress}>
            <SVG.IconStar fill={item.icon_color} />
          </Touchable>
        )}
      </Touchable>
      {channelData?.map((el, idx) => (
        <ChannelItem
          c={el}
          isActive={currentChannel.channel_id === el.channel_id}
          key={el.channel_id}
          isFirst={idx === 0}
        />
      ))}
      {isOwner && (
        <Touchable
          style={[styles.createButton, {backgroundColor: colors.background}]}
          onPress={onCreateChannel}>
          <SVG.IconPlus fill={colors.subtext} />
          <Text
            style={[
              AppStyles.TextSemi15,
              {color: colors.subtext, marginLeft: 13},
            ]}>
            New channel
          </Text>
        </Touchable>
      )}
      <View style={{height: 10}} />
    </View>
  );
};

const styles = StyleSheet.create({
  space: {
    marginHorizontal: 10,
    paddingTop: 15,
    borderRadius: 5,
    borderWidth: 1,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  groupName: {
    marginHorizontal: 15,
    flex: 1,
  },
  logoSpaceWrapper: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrapper: {
    padding: 5,
  },
  createButton: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 27,
    borderRadius: 5,
  },
});

export default memo(SpaceItem);
