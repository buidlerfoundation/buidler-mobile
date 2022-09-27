import {useNavigation, useRoute} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import PinPostItem from 'components/PinPostItem';
import Touchable from 'components/Touchable';
import usePostData from 'hook/usePostData';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, View, Text} from 'react-native';

const PinPostDetailScreen = () => {
  const {colors} = useThemeColor();
  const navigation = useNavigation();
  const route = useRoute();
  const postId = useMemo(() => route.params?.postId, [route.params?.postId]);
  const pinPost = usePostData(postId);
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  if (!pinPost.data) return null;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <Text style={[styles.title, {color: colors.text}]}>Pin Post</Text>
      </View>
      <PinPostItem pinPost={pinPost.data} detail />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
  },
  title: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 26,
    marginLeft: 20,
    flex: 1,
  },
});

export default memo(PinPostDetailScreen);
