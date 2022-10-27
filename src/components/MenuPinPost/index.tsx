import AsyncStorage from '@react-native-async-storage/async-storage';
import {emojiDefault} from 'common/AppConfig';
import AppDimension from 'common/AppDimension';
import {AsyncKey} from 'common/AppStorage';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import MenuEmojiItem from 'components/MenuEmojiItem';
import MenuItem from 'components/MenuItem';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Image} from 'react-native';

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
      } else {
        setHistory(emojiDefault);
        AsyncStorage.setItem(AsyncKey.emojiKey, JSON.stringify(emojiDefault));
      }
    });
  }, []);
  const {colors} = useThemeColor();
  const addToHistoryAsync = useCallback(async emoji => {
    const previous = await AsyncStorage.getItem(AsyncKey.emojiKey);
    let value = [];
    const time = new Date().getTime();
    let existed = false;
    const record = Object.assign({}, emoji, {
      count: 1,
      timestamp: time,
    });
    if (!previous) {
      value.push(record);
    } else {
      let json = JSON.parse(previous);
      json = json.map(el => {
        if (el.unified === emoji.unified) {
          existed = true;
          return {
            ...el,
            count: el.count + 1,
            timestamp: time,
          };
        }
        return el;
      });
      if (existed) {
        value = json;
      } else {
        value = [record, ...json];
      }
      value.sort((v1, v2) => {
        if (v1.count < v2.count) return 1;
        if (v1.count > v2.count) return -1;
        if (v1.timestamp < v2.timestamp) return 1;
        return -1;
      });
    }
    AsyncStorage.setItem(AsyncKey.emojiKey, JSON.stringify(value));
  }, []);
  const emojiData = useMemo(() => {
    return new Array(5).fill({}).map((el, idx) => ({
      emoji: history?.[idx],
      key: `${idx}`,
    }));
  }, [history]);
  const handleEmojiSelected = useCallback(
    (emoji: any) => {
      onEmojiSelected(emoji);
      addToHistoryAsync(emoji);
    },
    [addToHistoryAsync, onEmojiSelected],
  );
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.menuEmoji}>
        {emojiData.map(el => (
          <MenuEmojiItem
            key={el.key}
            item={el}
            onEmojiSelected={handleEmojiSelected}
          />
        ))}
        <Touchable
          useReactNative
          style={[styles.emojiWrap]}
          onPress={openModalEmoji}>
          <Image source={SVG.IconEmotion} />
        </Touchable>
      </View>
      <View style={[styles.groupMenu, {backgroundColor: colors.border}]}>
        <MenuItem onPress={onReply} label="Reply" Icon={SVG.IconMenuReply} />
        {canJumpMessage && (
          <MenuItem
            onPress={onJumpToMessage}
            label="Jump to message"
            Icon={SVG.IconMenuJumpMessage}
          />
        )}
        {canUploadToIPFS && (
          <MenuItem
            onPress={onUploadToIPFS}
            label="Upload to IPFS"
            Icon={SVG.IconMenuUploadIPFS}
          />
        )}
        <MenuItem
          onPress={onCopyMessage}
          label="Copy message link"
          Icon={SVG.IconMenuCopyMessage}
        />
        <MenuItem
          onPress={onCopyPostLink}
          label="Copy post link"
          Icon={SVG.IconMenuCopyPost}
        />
        {canUnarchive && (
          <MenuItem
            onPress={onUnarchive}
            label="Unarchive"
            Icon={SVG.IconMenuUnarchive}
          />
        )}
        {canReport && (
          <MenuItem
            onPress={onReport}
            label="Report"
            Icon={SVG.IconMenuReport}
          />
        )}
      </View>
      {canArchive && (
        <MenuItem
          onPress={onArchive}
          label="Archive"
          Icon={SVG.IconMenuArchive}
          style={{marginTop: 15}}
        />
      )}
      {canDelete && (
        <MenuItem
          onPress={onDelete}
          label="Delete"
          Icon={SVG.IconMenuDelete}
          style={{marginTop: 15}}
        />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(MenuPinPost);
