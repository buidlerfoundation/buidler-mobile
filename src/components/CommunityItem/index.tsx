import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import CommunityLogo from 'components/CommunityLogo';
import Touchable from 'components/Touchable';
import useCommunityId from 'hook/useCommunityId';
import useThemeColor from 'hook/useThemeColor';
import {Community} from 'models';
import React, {memo, useCallback} from 'react';
import {StyleSheet, Text} from 'react-native';

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
  return (
    <Touchable
      style={[
        styles.container,
        {
          backgroundColor:
            communityId === community.team_id
              ? colors.border
              : colors.background,
        },
      ]}
      onPress={handlePress}>
      <CommunityLogo community={community} />
      <Text
        style={[
          styles.communityName,
          AppStyles.TextSemi15,
          {color: colors.text},
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
});

export default memo(CommunityItem);
