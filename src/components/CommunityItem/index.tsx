import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import CommunityLogo from 'components/CommunityLogo';
import Touchable from 'components/Touchable';
import useCommunityId from 'hook/useCommunityId';
import useThemeColor from 'hook/useThemeColor';
import {Community} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

type CommunityItemProps = {
  community: Community;
  onPress: (community: Community) => void;
  onPressMenu: (community: Community) => void;
};

const CommunityItem = ({
  community,
  onPress,
  onPressMenu,
}: CommunityItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(
    () => onPress(community),
    [community, onPress],
  );
  const handleMenuPress = useCallback(
    () => onPressMenu(community),
    [community, onPressMenu],
  );
  const communityId = useCommunityId();
  const isActive = useMemo(
    () => communityId === community.team_id,
    [community.team_id, communityId],
  );
  const isUnseen = useMemo(() => !community.seen, [community.seen]);
  return (
    <Touchable
      style={[
        styles.container,
        {
          backgroundColor: isActive ? colors.border : colors.background,
        },
      ]}
      onPress={handlePress}>
      <View>
        <CommunityLogo community={community} />
        {isUnseen && (
          <View
            style={[
              styles.unseenBadgeWrap,
              {backgroundColor: colors.background},
            ]}>
            <View
              style={[styles.unseenBadge, {backgroundColor: colors.mention}]}
            />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.communityName,
          AppStyles.TextSemi15,
          {color: isUnseen || isActive ? colors.text : colors.subtext},
        ]}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {community.team_display_name}
      </Text>
      <Touchable onPress={handleMenuPress}>
        <SVG.IconMore fill={colors.text} />
      </Touchable>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    height: 70,
    paddingHorizontal: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityName: {
    marginHorizontal: 15,
    flex: 1,
  },
  unseenBadgeWrap: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: -5,
    right: -5,
  },
  unseenBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default memo(CommunityItem);
