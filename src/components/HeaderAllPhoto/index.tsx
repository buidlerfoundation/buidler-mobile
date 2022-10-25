import {useNavigation} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback} from 'react';
import {View, StyleSheet, Text} from 'react-native';

const HeaderAllPhoto = () => {
  const currentAlbum = useAppSelector(state => state.gallery.currentAlbum);
  const navigation = useNavigation();
  const {colors} = useThemeColor();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openAlbum = useCallback(() => {}, []);
  const onClear = useCallback(() => {}, []);
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.headerLeft}>
        <Touchable style={styles.buttonHeader} onPress={goBack}>
          <Text style={[AppStyles.TextSemi16, {color: colors.subtext}]}>
            Cancel
          </Text>
        </Touchable>
      </View>
      <View style={styles.headerCenter}>
        {currentAlbum && (
          <Touchable style={styles.buttonHeader} onPress={openAlbum}>
            <Text
              style={[
                AppStyles.TextBold17,
                {color: colors.text, marginRight: 8},
              ]}>
              {currentAlbum.name}
            </Text>
            <SVG.IconCollapse fill={colors.text} />
          </Touchable>
        )}
      </View>
      <View style={styles.headerRight}>
        <Touchable style={styles.buttonHeader} onPress={onClear}>
          <Text style={[AppStyles.TextSemi16, {color: colors.subtext}]}>
            Clear
          </Text>
        </Touchable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 10 + AppDimension.extraTop,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  buttonHeader: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default memo(HeaderAllPhoto);
