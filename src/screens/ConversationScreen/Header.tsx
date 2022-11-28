import {useNavigation} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import ScreenID from 'common/ScreenID';
import SVG from 'common/SVG';
import ChannelTitle from 'components/ChannelTitle';
import DirectChannelTitle from 'components/DirectChannelTitle';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';

type HeaderProps = {
  direct?: boolean;
};

const Header = ({direct}: HeaderProps) => {
  const {colors} = useThemeColor();
  const navigation = useNavigation();
  const openSideMenu = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);
  const onPinPress = useCallback(() => {
    navigation.navigate(ScreenID.PinPostScreen);
  }, [navigation]);
  return (
    <View style={styles.container}>
      <Touchable onPress={openSideMenu}>
        <SVG.IconSideMenu fill={colors.text} />
      </Touchable>
      {direct ? <DirectChannelTitle /> : <ChannelTitle />}
      {!direct && (
        <Touchable onPress={onPinPress}>
          <SVG.IconPin fill={colors.text} />
        </Touchable>
      )}
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
  },
});

export default memo(Header);
