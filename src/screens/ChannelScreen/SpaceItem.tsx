import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Space} from 'models';
import useThemeColor from 'hook/useThemeColor';
import SpaceIcon from 'components/SpaceIcon';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import {actionTypes} from 'actions/actionTypes';
import ChannelItem from './ChannelItem';
import useCurrentChannel from 'hook/useCurrentChannel';
import useChannel from 'hook/useChannel';
import AppStyles from 'common/AppStyles';

type SpaceItemProps = {
  item: Space;
  teamId: string;
};

const SpaceItem = ({item}: SpaceItemProps) => {
  const isCollapsed = useMemo(() => !item.isExpanded, [item.isExpanded]);
  const currentChannel = useCurrentChannel();
  const channel = useChannel();
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const toggleSpace = useCallback(() => {
    dispatch({
      type: actionTypes.UPDATE_EXPAND_SPACE_ITEM,
      payload: {
        spaceId: item.space_id,
        isExpand: isCollapsed,
      },
    });
  }, [dispatch, isCollapsed, item.space_id]);
  const channelData = useMemo(() => {
    return item.channel_ids
      .map(el => channel.find(c => c.channel_id === el))
      .filter(el => {
        if (isCollapsed)
          return (
            !!el && (!el.seen || el.channel_id === currentChannel.channel_id)
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
      <Touchable style={styles.groupHead} onPress={toggleSpace}>
        <View
          style={[styles.logoSpaceWrapper, {backgroundColor: colors.border}]}>
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
          <View style={styles.badgeWrapper}>
            <SVG.IconStar fill={item.icon_color} />
          </View>
        )}
      </Touchable>
      {channelData.map((el, idx) => (
        <ChannelItem
          c={el}
          isActive={currentChannel.channel_id === el.channel_id}
          key={el.channel_id}
          isFirst={idx === 0}
        />
      ))}
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
    marginRight: 5,
  },
});

export default memo(SpaceItem);
