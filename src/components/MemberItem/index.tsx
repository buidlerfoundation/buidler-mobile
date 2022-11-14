import {useNavigation} from '@react-navigation/native';
import AppStyles from 'common/AppStyles';
import ScreenID from 'common/ScreenID';
import AvatarView from 'components/AvatarView';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {UserData} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, useWindowDimensions, Text} from 'react-native';

type MemberItemProps = {
  item: UserData;
  index: number;
};

const MemberItem = ({item, index}: MemberItemProps) => {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const itemWidth = useMemo(() => Math.floor((width - 70) / 3), [width]);
  const {colors} = useThemeColor();
  const marginLeft = useMemo(() => (index % 3 === 0 ? 20 : 15), [index]);
  const onUserPress = useCallback(
    () => navigation.navigate(ScreenID.UserScreen, {userId: item.user_id}),
    [item.user_id, navigation],
  );
  return (
    <Touchable
      style={[styles.container, {width: itemWidth, marginLeft}]}
      useReactNative
      onPress={onUserPress}>
      <AvatarView user={item} withStatus={false} size={30} />
      <Text
        style={[styles.userName, AppStyles.TextMed14, {color: colors.text}]}
        numberOfLines={1}
        ellipsizeMode="middle">
        {item.user_name}
      </Text>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    marginTop: 8,
    flex: 1,
  },
});

export default memo(MemberItem);
