import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import ButtonClose from 'components/ButtonClose';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import useUserData from 'hook/useUserData';
import {UserData} from 'models';
import React, {memo, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type MenuUserProps = {
  user: UserData;
  onClose: () => void;
  onBlockPress: () => void;
  onEditPress: () => void;
};

const MenuUser = ({
  user,
  onClose,
  onBlockPress,
  onEditPress,
}: MenuUserProps) => {
  const userData = useUserData();
  const {colors} = useThemeColor();
  const isCurrentUser = useMemo(
    () => userData.user_id === user.user_id,
    [user.user_id, userData.user_id],
  );
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
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
        {!isCurrentUser && (
          <Touchable
            style={[styles.menuItem, {backgroundColor: colors.border}]}
            onPress={onBlockPress}>
            <SVG.IconMenuBlock />
            <Text
              style={[
                AppStyles.TextSemi16,
                {color: colors.text, marginLeft: 15},
              ]}>
              {user?.is_blocked ? 'Unblock' : 'Block'}
            </Text>
          </Touchable>
        )}
        {isCurrentUser && (
          <Touchable
            style={[styles.menuItem, {backgroundColor: colors.border}]}
            onPress={onEditPress}>
            <SVG.IconMenuEdit />
            <Text
              style={[
                AppStyles.TextSemi16,
                {color: colors.text, marginLeft: 15},
              ]}>
              Edit Profile
            </Text>
          </Touchable>
        )}
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
  menuItem: {
    marginHorizontal: 20,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default memo(MenuUser);
