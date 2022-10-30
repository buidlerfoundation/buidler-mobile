import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import ChannelIcon from 'components/ChannelIcon';
import MessageItem from 'components/MessageItem';
import SwitchButton from 'components/SwitchButton';
import Touchable from 'components/Touchable';
import useCurrentChannel from 'hook/useCurrentChannel';
import useThemeColor from 'hook/useThemeColor';
import useUserData from 'hook/useUserData';
import {MessageData} from 'models';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type MenuConfirmPinProps = {
  message?: MessageData;
  onClose: () => void;
  onPin: (isLock: boolean) => void;
};

const MenuConfirmPin = ({message, onClose, onPin}: MenuConfirmPinProps) => {
  const [isLockOn, setLockOn] = useState(false);
  const userData = useUserData();
  const {colors} = useThemeColor();
  const channel = useCurrentChannel();
  const handlePin = useCallback(() => {
    onPin(isLockOn);
  }, [isLockOn, onPin]);
  const isOwner = useMemo(
    () => userData.user_id === message?.sender_id,
    [message?.sender_id, userData.user_id],
  );
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <Text style={[AppStyles.TextBold17, {color: colors.text}]}>
          New Pin Post
        </Text>
        <View style={[styles.channel, {borderColor: colors.border}]}>
          <ChannelIcon channel={channel} color={colors.text} />
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.lightText, marginLeft: 8},
            ]}>
            {channel.channel_name}
          </Text>
        </View>
      </View>
      <Text
        style={[AppStyles.TextMed15, {color: colors.subtext, marginTop: 20}]}>
        Just to make sure you want to pin this message.
      </Text>
      {message && (
        <MessageItem
          style={[styles.messageItem, {borderColor: colors.border}]}
          item={message}
          embeds
        />
      )}
      {isOwner && (
        <>
          <View style={styles.lockContainer}>
            <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
              Lock Content
            </Text>
            <SwitchButton toggleOn={isLockOn} onChange={setLockOn} />
          </View>
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.subtext, marginTop: 15},
            ]}>
            Allow to lock and store content on decentralized storage. No one
            will be able to change the original content, including you!
          </Text>
        </>
      )}
      <Touchable
        style={[
          styles.bottomButton,
          {backgroundColor: colors.border, marginTop: 25},
        ]}
        useReactNative
        onPress={onClose}>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>Cancel</Text>
      </Touchable>
      <Touchable
        style={[styles.bottomButton, {backgroundColor: colors.border}]}
        useReactNative
        onPress={handlePin}>
        <Text style={[AppStyles.TextSemi16, {color: colors.mention}]}>Pin</Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 15,
    paddingBottom: 12 + AppDimension.extraBottom,
    borderRadius: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channel: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  messageItem: {
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 10,
  },
  lockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  bottomButton: {
    marginTop: 10,
    height: 60,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(MenuConfirmPin);
