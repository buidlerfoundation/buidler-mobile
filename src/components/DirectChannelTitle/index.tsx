import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import ModalBottom from 'components/ModalBottom';
import Touchable from 'components/Touchable';
import useDirectChannelUser from 'hook/useDirectChannelUser';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

const DirectChannelTitle = () => {
  const [openTooltip, setOpenTooltip] = useState(false);
  const {colors} = useThemeColor();
  const otherUser = useDirectChannelUser();
  const toggleDirectTooltip = useCallback(
    () => setOpenTooltip(current => !current),
    [],
  );
  return (
    <View style={styles.titleWrap}>
      <AvatarView user={otherUser} />
      <Text
        style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {otherUser?.user_name}
      </Text>
      <Touchable
        useReactNative
        style={{padding: 10}}
        onPress={toggleDirectTooltip}>
        <SVG.IconLock width={20} height={20} fill={colors.text} />
      </Touchable>
      <ModalBottom
        isVisible={openTooltip}
        onSwipeComplete={toggleDirectTooltip}
        onBackdropPress={toggleDirectTooltip}>
        <View
          style={[styles.tooltipWrap, {backgroundColor: colors.background}]}>
          <View style={[styles.tooltipContainer, {borderColor: colors.border}]}>
            <View style={styles.tooltipHead}>
              <SVG.IconLock fill={colors.text} width={20} height={20} />
              <Text
                style={[
                  AppStyles.TextSemi14,
                  {color: colors.text, marginLeft: 5},
                ]}>
                End-to-end encryption
              </Text>
            </View>
            <Text
              style={[
                AppStyles.TextMed12,
                {color: colors.lightText, marginTop: 10},
              ]}>
              Private and secure by design. Only you, with your seed phrase can
              access your messages with built-in end-to-end encryption by
              default. What happens between us stays with us.
            </Text>
          </View>
          <Touchable
            useReactNative
            style={[styles.btnBottom, {backgroundColor: colors.border}]}
            onPress={toggleDirectTooltip}>
            <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
              Dismiss
            </Text>
          </Touchable>
        </View>
      </ModalBottom>
    </View>
  );
};

const styles = StyleSheet.create({
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  title: {
    marginLeft: 12,
    maxWidth: '80%',
  },
  tooltipWrap: {
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: AppDimension.extraBottom + 32,
  },
  tooltipContainer: {
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
  },
  tooltipHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnBottom: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 50,
    marginTop: 70,
  },
});

export default memo(DirectChannelTitle);
