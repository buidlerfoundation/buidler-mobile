import AppDimension from 'common/AppDimension';
import SVG from 'common/SVG';
import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Touchable from 'components/Touchable';
import Fonts from 'common/Fonts';
import NavigationServices from 'services/NavigationServices';

type NavigationHeaderProps = {
  title?: string;
};

const NavigationHeader = ({title}: NavigationHeaderProps) => {
  const {colors} = useTheme();
  return (
    <View style={styles.container}>
      <Touchable
        style={styles.titleView}
        onPress={() => NavigationServices.goBack()}>
        <View style={styles.iconWrapper}>
          <SVG.IconArrowBack fill={colors.text} />
        </View>
        {!!title && (
          <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
        )}
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: AppDimension.headerHeight + AppDimension.extraTop,
    paddingTop: AppDimension.extraTop,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    lineHeight: 24,
    marginLeft: 10,
  },
});

export default memo(NavigationHeader);
