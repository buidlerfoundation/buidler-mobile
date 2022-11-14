import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';
import SVG from 'common/SVG';
import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import AppDimension from 'common/AppDimension';
import MenuItem from 'components/MenuItem';

type MenuNotificationProps = {
  onMarkRead: () => void;
  onRemove: () => void;
  onTurnOffNotification: () => void;
  onTurnOnNotification: () => void;
  canTurnOff?: boolean;
  canTurnOn?: boolean;
  entityType?: 'post' | 'channel';
};

const MenuNotification = ({
  onMarkRead,
  onRemove,
  onTurnOffNotification,
  onTurnOnNotification,
  canTurnOff,
  canTurnOn,
  entityType,
}: MenuNotificationProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.groupMenu, {backgroundColor: colors.border}]}>
        <MenuItem
          onPress={onMarkRead}
          Icon={SVG.IconMenuMarkRead}
          label="Mark as read"
        />
        {canTurnOff && (
          <MenuItem
            onPress={onTurnOffNotification}
            Icon={SVG.IconMenuSilent}
            label={`Turn off notification for this ${entityType}`}
          />
        )}
        {canTurnOn && (
          <MenuItem
            onPress={onTurnOnNotification}
            Icon={SVG.IconMenuNotification}
            label={`Turn on notification for this ${entityType}`}
          />
        )}
        <MenuItem
          onPress={onRemove}
          Icon={SVG.IconMenuClose}
          label="Remove notification"
        />
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

export default memo(MenuNotification);
