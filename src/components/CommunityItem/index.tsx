import Fonts from 'common/Fonts';
import CommunityLogo from 'components/CommunityLogo';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {Community} from 'models';
import React, {memo, useCallback} from 'react';
import {StyleSheet, Text} from 'react-native';

type CommunityItemProps = {
  community: Community;
  onPress: (community: Community) => void;
};

const CommunityItem = ({community, onPress}: CommunityItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(
    () => onPress(community),
    [community, onPress],
  );
  return (
    <Touchable
      style={[styles.container, {backgroundColor: colors.background}]}
      onPress={handlePress}>
      <CommunityLogo community={community} />
      <Text
        style={[styles.communityName, {color: colors.text}]}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {community.team_display_name}
      </Text>
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
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    lineHeight: 26,
  },
});

export default memo(CommunityItem);
