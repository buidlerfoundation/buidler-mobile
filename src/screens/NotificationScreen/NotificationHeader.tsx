import {markAsReadAllNotification} from 'actions/NotificationActions';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import MenuNotificationScreen from 'components/MenuNotificationScreen';
import ModalBottom from 'components/ModalBottom';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';

const NotificationHeader = () => {
  const dispatch = useAppDispatch();
  const [isOpenMenu, setOpenMenu] = useState(false);
  const {colors} = useThemeColor();
  const onCloseMenu = useCallback(() => setOpenMenu(false), []);
  const onPressMenu = useCallback(() => setOpenMenu(true), []);
  const onMarkRead = useCallback(() => {
    dispatch(markAsReadAllNotification());
    onCloseMenu();
  }, [dispatch, onCloseMenu]);
  const onOpenSetting = useCallback(() => {}, []);
  return (
    <View style={styles.container}>
      <Text style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
        Notification
      </Text>
      <Touchable onPress={onPressMenu}>
        <SVG.IconMore fill={colors.text} />
      </Touchable>
      <ModalBottom
        isVisible={isOpenMenu}
        onSwipeComplete={onCloseMenu}
        onBackdropPress={onCloseMenu}>
        <MenuNotificationScreen
          onMarkRead={onMarkRead}
          onOpenSetting={onOpenSetting}
        />
      </ModalBottom>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
    marginTop: AppDimension.extraTop,
  },
  title: {
    flex: 1,
  },
});

export default memo(NotificationHeader);
