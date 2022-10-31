import AppStyles from 'common/AppStyles';
import AvatarView from 'components/AvatarView';
import useThemeColor from 'hook/useThemeColor';
import {UserData} from 'models';
import React, {memo, useMemo} from 'react';
import {View, StyleSheet, useWindowDimensions, Text} from 'react-native';

type MemberItemProps = {
  item: UserData;
  index: number;
};

const MemberItem = ({item, index}: MemberItemProps) => {
  const {width} = useWindowDimensions();
  const itemWidth = useMemo(() => Math.floor((width - 85) / 4), [width]);
  const {colors} = useThemeColor();
  const marginLeft = useMemo(() => (index % 4 === 0 ? 20 : 15), [index]);
  return (
    <View style={[styles.container, {width: itemWidth, marginLeft}]}>
      <AvatarView user={item} withStatus={false} size={30} />
      <Text
        style={[styles.userName, AppStyles.TextMed14, {color: colors.text}]}
        numberOfLines={1}
        ellipsizeMode="middle">
        {item.user_name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    marginTop: 8,
    flex: 1,
  },
});

export default memo(MemberItem);
