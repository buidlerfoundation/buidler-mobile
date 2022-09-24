import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Fonts from 'common/Fonts';
import {Space} from 'models';
import useThemeColor from 'hook/useThemeColor';
import SpaceIcon from 'components/SpaceIcon';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import {actionTypes} from 'actions/actionTypes';

type SpaceItemProps = {
  item: Space;
  teamId: string;
  isEmpty: boolean;
};

const SpaceItem = ({item, isEmpty}: SpaceItemProps) => {
  const isCollapsed = useMemo(() => !item.isExpanded, [item.isExpanded]);
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
  return (
    <Touchable
      style={[
        styles.space,
        {
          backgroundColor: colors.background,
          borderColor: colors.background,
        },
        isEmpty && {
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
          paddingBottom: 5,
        },
      ]}
      onPress={toggleSpace}>
      <View style={styles.groupHead}>
        <View
          style={[styles.logoSpaceWrapper, {backgroundColor: colors.border}]}>
          <SpaceIcon space={item} />
        </View>
        <Text
          style={[
            styles.groupName,
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
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  space: {
    marginHorizontal: 10,
    paddingLeft: 10,
    paddingTop: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
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
    lineHeight: 20,
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
