import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';
import SVG from 'common/SVG';
import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import AppDimension from 'common/AppDimension';
import MenuItem from 'components/MenuItem';

type MenuNotificationScreenProps = {
  onMarkRead: () => void;
  canOpenSetting?: boolean;
  onOpenSetting?: () => void;
};

const MenuNotificationScreen = ({
  onMarkRead,
  canOpenSetting,
  onOpenSetting,
}: MenuNotificationScreenProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.groupMenu, {backgroundColor: colors.border}]}>
        <MenuItem
          onPress={onMarkRead}
          Icon={SVG.IconMenuMarkRead}
          label="Mark as read"
        />
        {canOpenSetting && (
          <MenuItem
            onPress={onOpenSetting}
            Icon={SVG.IconMenuSetting}
            label="Open notification setting"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: AppDimension.extraBottom + 12,
    minHeight: 350,
  },
  groupMenu: {
    borderRadius: 5,
  },
  menuLabel: {
    marginLeft: 15,
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
  },
});

export default memo(MenuNotificationScreen);
