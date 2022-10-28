import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import CommunityLogo from 'components/CommunityLogo';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {Community} from 'models';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type MenuConfirmLeaveCommunityProps = {
  community: Community;
  onClose: () => void;
  onConfirm: () => void;
};

const MenuConfirmLeaveCommunity = ({
  community,
  onClose,
  onConfirm,
}: MenuConfirmLeaveCommunityProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {community && (
        <View style={styles.header}>
          <CommunityLogo community={community} size={25} borderRadius={6} />
          <Text
            style={[
              AppStyles.TextBold17,
              {marginLeft: 12, color: colors.text},
            ]}>
            {community.team_display_name}
          </Text>
        </View>
      )}
      <Text
        style={[
          AppStyles.TextMed15,
          {marginTop: 22.5, color: colors.subtext, alignSelf: 'center'},
        ]}>
        Are you sure you want to leave this community?
      </Text>
      <Touchable
        style={[
          styles.bottomButton,
          {backgroundColor: colors.border, marginTop: 25},
        ]}
        onPress={onClose}>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>Cancel</Text>
      </Touchable>
      <Touchable
        style={[
          styles.bottomButton,
          {backgroundColor: colors.border, marginTop: 10},
        ]}
        onPress={onConfirm}>
        <Text style={[AppStyles.TextSemi16, {color: colors.urgent}]}>
          Leave
        </Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 22.5,
    paddingHorizontal: 15,
    paddingBottom: 12 + AppDimension.extraBottom,
    borderRadius: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  bottomButton: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
});

export default memo(MenuConfirmLeaveCommunity);
