import React, {memo, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import AppDimension from 'common/AppDimension';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import MenuEmojiItem from 'components/MenuEmojiItem';

type MenuMessageProps = {
  onReply: () => void;
  onEdit: () => void;
  canEdit: boolean;
  onPin?: () => void;
  canPin: boolean;
  onCopyMessage: () => void;
  canDelete: boolean;
  onDelete: () => void;
  openModalEmoji?: () => void;
  onEmojiSelected?: (emoji: any) => void;
};

const MenuMessage = ({
  onEdit,
  onReply,
  onPin,
  onCopyMessage,
  onDelete,
  canEdit,
  canPin,
  canDelete,
  openModalEmoji,
  onEmojiSelected,
}: MenuMessageProps) => {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    AsyncStorage.getItem(AsyncKey.emojiKey).then(res => {
      if (res) {
        setHistory(JSON.parse(res));
      }
    });
  }, []);
  const {colors} = useThemeColor();
  const emojiData = useMemo(() => {
    return new Array(5).fill({}).map((el, idx) => ({
      emoji: history?.[idx],
      key: `${idx}`,
    }));
  }, [history]);
  return (
    <View
      style={[styles.container, {backgroundColor: colors.backgroundHeader}]}>
      <View style={styles.menuEmoji}>
        {emojiData.map(el => (
          <MenuEmojiItem
            key={el.key}
            item={el}
            onEmojiSelected={onEmojiSelected}
          />
        ))}
        <Touchable
          useReactNative
          style={[styles.emojiWrap, {backgroundColor: colors.border}]}
          onPress={openModalEmoji}>
          <SVG.IconPlus fill={colors.text} />
        </Touchable>
      </View>
      <View style={[styles.groupMenu, {backgroundColor: colors.background}]}>
        <Touchable style={styles.menuItem} onPress={onReply}>
          <SVG.IconMenuReply />
          <Text style={[styles.menuLabel, {color: colors.text}]}>Reply</Text>
        </Touchable>
        {canPin && (
          <Touchable style={styles.menuItem} onPress={onPin}>
            <SVG.IconMenuPin />
            <Text style={[styles.menuLabel, {color: colors.text}]}>Pin</Text>
          </Touchable>
        )}
        {canEdit && (
          <Touchable style={styles.menuItem} onPress={onEdit}>
            <SVG.IconMenuEdit />
            <Text style={[styles.menuLabel, {color: colors.text}]}>Edit</Text>
          </Touchable>
        )}
        <Touchable style={styles.menuItem} onPress={onCopyMessage}>
          <SVG.IconMenuCopyMessage />
          <Text style={[styles.menuLabel, {color: colors.text}]}>
            Copy message link
          </Text>
        </Touchable>
      </View>
      {canDelete && (
        <Touchable
          style={[
            styles.menuItem,
            {
              marginTop: 10,
              borderRadius: 5,
              backgroundColor: colors.background,
            },
          ]}
          onPress={onDelete}>
          <SVG.IconMenuDelete />
          <Text style={[styles.menuLabel, {color: colors.text}]}>Delete</Text>
        </Touchable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: AppDimension.extraBottom + 12,
    minHeight: 350,
  },
  groupMenu: {
    borderRadius: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuLabel: {
    marginLeft: 15,
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
  },
  menuEmoji: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  emojiWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(MenuMessage);
