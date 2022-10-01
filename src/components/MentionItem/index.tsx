import Fonts from 'common/Fonts';
import AvatarView from 'components/AvatarView';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {UserData} from 'models';
import React, {memo, useCallback} from 'react';
import {Text, StyleSheet} from 'react-native';

type MentionItemProps = {
  user: UserData;
  onPress: (user: UserData) => void;
};

const MentionItem = ({user, onPress}: MentionItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(() => onPress(user), [onPress, user]);
  return (
    <Touchable style={styles.container} onPress={handlePress}>
      <AvatarView user={user} />
      <Text
        style={[styles.userName, {color: colors.subtext}]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {user.user_name}
      </Text>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  userName: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    lineHeight: 26,
    flex: 1,
    marginLeft: 15,
  },
});

export default memo(MentionItem);
