import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import MessageItem from 'components/MessageItem';
import PinPostItem from 'components/PinPostItem';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {MessageData, TaskData} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type MenuConfirmDeleteMessageProps = {
  onClose?: () => void;
  handleDelete?: () => void;
  selectedMessage?: MessageData;
  selectedPinPost?: TaskData;
};

const MenuConfirmDeleteMessage = ({
  onClose,
  selectedMessage,
  selectedPinPost,
  handleDelete,
}: MenuConfirmDeleteMessageProps) => {
  const {colors} = useThemeColor();
  const contentType = useMemo(
    () => (!!selectedPinPost || !!selectedMessage?.task ? 'post' : 'message'),
    [selectedMessage?.task, selectedPinPost],
  );
  const ItemDelete = useCallback(() => {
    if (selectedPinPost || selectedMessage?.task) {
      return (
        <View style={styles.itemDeleteContainer}>
          <PinPostItem
            style={[styles.messageItem, {borderColor: colors.border}]}
            pinPost={selectedPinPost || selectedMessage?.task}
            embeds
            embedReport
          />
        </View>
      );
    }
    if (selectedMessage) {
      return (
        <View style={styles.itemDeleteContainer}>
          <MessageItem
            style={[styles.messageItem, {borderColor: colors.border}]}
            item={selectedMessage}
            embeds
          />
        </View>
      );
    }
    return null;
  }, [colors.border, selectedMessage, selectedPinPost]);
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text
        style={[
          AppStyles.TextBold17,
          {
            color: colors.text,
            alignSelf: 'center',
            textTransform: 'capitalize',
          },
        ]}>
        Delete {contentType}
      </Text>
      <Text
        style={[
          AppStyles.TextMed15,
          {color: colors.subtext, alignSelf: 'center', marginTop: 24},
        ]}>
        Are you sure you want to delete this {contentType}?
      </Text>
      <ItemDelete />
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
        style={[
          styles.bottomButton,
          {backgroundColor: colors.urgent, marginTop: 15},
        ]}
        useReactNative
        onPress={handleDelete}>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>Delete</Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 15,
    paddingBottom: 15 + AppDimension.extraBottom,
    borderRadius: 15,
  },
  bottomButton: {
    height: 60,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDeleteContainer: {
    marginTop: 10,
  },
  messageItem: {
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 0,
  },
});

export default memo(MenuConfirmDeleteMessage);
