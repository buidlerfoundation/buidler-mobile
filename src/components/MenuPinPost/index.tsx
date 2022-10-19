import AsyncStorage from '@react-native-async-storage/async-storage';
import AppDimension from 'common/AppDimension';
import {AsyncKey} from 'common/AppStorage';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import MenuEmojiItem from 'components/MenuEmojiItem';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';

type MenuPinPostProps = {
  onReply: () => void;
  onJumpToMessage?: () => void;
  canUploadToIPFS?: boolean;
  onUploadToIPFS: () => void;
  onCopyMessage: () => void;
  onCopyPostLink: () => void;
  canArchive?: boolean;
  canUnarchive?: boolean;
  onArchive: () => void;
  onUnarchive: () => void;
  canDelete?: boolean;
  onDelete: () => void;
  canJumpMessage?: boolean;
  openModalEmoji?: () => void;
  onEmojiSelected?: (emoji: any) => void;
  canReport?: boolean;
  onReport?: () => void;
};

const MenuPinPost = ({
  onReply,
  onUploadToIPFS,
  onCopyMessage,
  onCopyPostLink,
  onArchive,
  onUnarchive,
  onDelete,
  onJumpToMessage,
  canUploadToIPFS,
  canArchive,
  canDelete,
  canUnarchive,
  canJumpMessage,
  openModalEmoji,
  onEmojiSelected,
  canReport,
  onReport,
}: MenuPinPostProps) => {
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
        {canJumpMessage && (
          <Touchable style={styles.menuItem} onPress={onJumpToMessage}>
            <SVG.IconMenuJumpMessage />
            <Text style={[styles.menuLabel, {color: colors.text}]}>
              Jump to message
            </Text>
          </Touchable>
        )}
        {canUploadToIPFS && (
          <Touchable style={styles.menuItem} onPress={onUploadToIPFS}>
            <SVG.IconMenuUploadIPFS />
            <Text style={[styles.menuLabel, {color: colors.text}]}>
              Upload to IPFS
            </Text>
          </Touchable>
        )}
        <Touchable style={styles.menuItem} onPress={onCopyMessage}>
          <SVG.IconMenuCopyMessage />
          <Text style={[styles.menuLabel, {color: colors.text}]}>
            Copy message link
          </Text>
        </Touchable>
        <Touchable style={styles.menuItem} onPress={onCopyPostLink}>
          <SVG.IconMenuCopyPost />
          <Text style={[styles.menuLabel, {color: colors.text}]}>
            Copy post link
          </Text>
        </Touchable>
        {canUnarchive && (
          <Touchable style={styles.menuItem} onPress={onUnarchive}>
            <SVG.IconMenuUnarchive />
            <Text style={[styles.menuLabel, {color: colors.text}]}>
              Unarchive
            </Text>
          </Touchable>
        )}
        {canReport && (
          <Touchable style={styles.menuItem} onPress={onReport}>
            <SVG.IconMenuReport />
            <Text style={[styles.menuLabel, {color: colors.text}]}>Report</Text>
          </Touchable>
        )}
      </View>
      {canArchive && (
        <Touchable
          style={[
            styles.menuItem,
            {
              marginTop: 10,
              borderRadius: 5,
              backgroundColor: colors.background,
            },
          ]}
          onPress={onArchive}>
          <SVG.IconMenuArchive />
          <Text style={[styles.menuLabel, {color: colors.text}]}>Archive</Text>
        </Touchable>
      )}
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12.5,
  },
  menuLabel: {
    marginLeft: 15,
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
  },
  groupMenu: {
    borderRadius: 5,
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

export default memo(MenuPinPost);
