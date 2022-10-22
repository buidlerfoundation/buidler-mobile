import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import AvatarView from 'components/AvatarView';
import ButtonClose from 'components/ButtonClose';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {UserData} from 'models';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type MenuUserProps = {
  user: UserData;
  onClose: () => void;
};

const MenuUser = ({user, onClose}: MenuUserProps) => {
  const {colors} = useThemeColor();
  return (
    <View
      style={[styles.container, {backgroundColor: colors.backgroundHeader}]}>
      <View style={styles.header}>
        <AvatarView user={user} withStatus={false} size={30} />
        <Text
          style={[
            AppStyles.TextBold17,
            {marginHorizontal: 15, flex: 1, color: colors.text},
          ]}>
          {user.user_name}
        </Text>
        <ButtonClose onPress={onClose} />
      </View>
      <View style={styles.menu}>
        <Touchable style={styles.menuItem}></Touchable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    minHeight: 350,
    paddingBottom: 12 + AppDimension.extraBottom,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 10,
  },
  menu: {
    marginTop: 10,
  },
});

export default memo(MenuUser);
