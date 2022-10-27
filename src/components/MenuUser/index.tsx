import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import ButtonClose from 'components/ButtonClose';
import MenuItem from 'components/MenuItem';
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
          <MenuItem
            label={user?.is_blocked ? 'Unblock' : 'Block'}
            Icon={user?.is_blocked ? SVG.IconMenuUnblock : SVG.IconMenuBlock}
            onPress={onBlockPress}
          />
        )}
        {isCurrentUser && (
          <MenuItem
            label="Edit Profile"
            Icon={SVG.IconMenuEdit}
            onPress={onEditPress}
          />
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
    paddingHorizontal: 20,
  },
});

export default memo(MenuUser);
