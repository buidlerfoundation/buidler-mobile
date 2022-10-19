import {reportData} from 'common/AppConfig';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import MessageItem from 'components/MessageItem';
import PinPostItem from 'components/PinPostItem';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {MessageData, TaskData} from 'models';
import React, {memo, useCallback, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type ReportItemProps = {
  isActive: boolean;
  label: string;
  onPress: (label: string) => void;
};

const ReportItem = memo(({isActive, label, onPress}: ReportItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(() => onPress(label), [label, onPress]);
  return (
    <Touchable
      style={[
        styles.reportItem,
        {
          backgroundColor: isActive
            ? colors.activeBackground
            : colors.background,
        },
      ]}
      useReactNative
      onPress={handlePress}>
      <Text style={[AppStyles.TextMed15, {color: colors.text}]}>{label}</Text>
    </Touchable>
  );
});

type MenuReportProps = {
  onClose?: () => void;
  selectedMessage?: MessageData;
  selectedPinPost?: TaskData;
};

const MenuReport = ({
  onClose,
  selectedMessage,
  selectedPinPost,
}: MenuReportProps) => {
  const {colors} = useThemeColor();
  const [selected, setSelected] = useState('');
  const handleSubmit = useCallback(() => {
    alert('Submitted');
    onClose?.();
  }, [onClose]);
  const ItemReport = useCallback(() => {
    if (selectedPinPost || selectedMessage?.task) {
      return (
        <View style={styles.itemReportContainer}>
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
        <View style={styles.itemReportContainer}>
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
    <View
      style={[styles.container, {backgroundColor: colors.backgroundHeader}]}>
      <Text
        style={[
          AppStyles.TextBold17,
          {color: colors.text, alignSelf: 'center'},
        ]}>
        Report A Problem
      </Text>
      <ItemReport />
      <Text
        style={[AppStyles.TextMed15, {color: colors.subtext, marginTop: 20}]}>
        Select an option that best describes your issue. We won't let the person
        know who report them.
      </Text>
      <View style={styles.reportOptions}>
        {reportData.map(el => (
          <ReportItem
            key={el}
            label={el}
            isActive={selected === el}
            onPress={setSelected}
          />
        ))}
      </View>
      <Touchable
        style={[
          styles.bottomButton,
          {backgroundColor: colors.background, marginTop: 25},
        ]}
        useReactNative
        onPress={handleSubmit}
        disabled={!selected}>
        <Text style={[AppStyles.TextSemi16, {color: colors.urgent}]}>
          Submit
        </Text>
      </Touchable>
      <Touchable
        style={[
          styles.bottomButton,
          {backgroundColor: colors.background, marginTop: 10},
        ]}
        useReactNative
        onPress={onClose}>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>Cancel</Text>
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
  reportOptions: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reportItem: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  bottomButton: {
    height: 60,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemReportContainer: {
    marginTop: 24,
  },
  messageItem: {
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 0,
  },
});

export default memo(MenuReport);
