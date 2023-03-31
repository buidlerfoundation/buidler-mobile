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
  onOpen: () => void;
  showDAppBrowser?: boolean;
  onOpenRight?: () => void;
};

const Header = ({
  direct,
  onOpen,
  onOpenRight,
  showDAppBrowser,
}: HeaderProps) => {
  const {colors} = useThemeColor();
  const navigation = useNavigation();
  const onPinPress = useCallback(() => {
    navigation.navigate(ScreenID.PinPostScreen);
  }, [navigation]);
  const renderRight = useCallback(() => {
    if (direct) return null;
    if (showDAppBrowser) {
      return (
        <Touchable onPress={onOpenRight}>
          <SVG.IconBrowser fill={colors.text} />
        </Touchable>
      );
    }
    return (
      <Touchable onPress={onPinPress}>
        <SVG.IconPin fill={colors.text} />
      </Touchable>
    );
  }, [colors.text, direct, onOpenRight, onPinPress, showDAppBrowser]);
  return (
    <View style={styles.container}>
      <Touchable onPress={onOpen}>
        <SVG.IconSideMenu fill={colors.text} />
      </Touchable>
      {direct ? <DirectChannelTitle /> : <ChannelTitle />}
      {renderRight()}
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
