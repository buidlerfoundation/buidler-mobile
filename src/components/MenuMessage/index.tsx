import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import AppDimension from 'common/AppDimension';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import MenuEmojiItem from 'components/MenuEmojiItem';
import {emojiDefault} from 'common/AppConfig';
import MenuItem from 'components/MenuItem';

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
  canReport?: boolean;
  onReport?: () => void;
  onCopyMessageText?: () => void;
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
  canReport,
  onReport,
  onCopyMessageText,
}: MenuMessageProps) => {
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
  const {colors} = useThemeColor();
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
        <MenuItem onPress={onReply} Icon={SVG.IconMenuReply} label="Reply" />
        {canPin && (
          <MenuItem onPress={onPin} Icon={SVG.IconMenuPin} label="Pin" />
        )}
        {canEdit && (
          <MenuItem onPress={onEdit} Icon={SVG.IconMenuEdit} label="Edit" />
        )}
        <MenuItem
          onPress={onCopyMessageText}
          Icon={SVG.IconMenuCopy}
          label="Copy message"
        />
        <MenuItem
          onPress={onCopyMessage}
          Icon={SVG.IconMenuCopyMessage}
          label="Copy message link"
        />
        {canReport && (
          <MenuItem
            onPress={onReport}
            Icon={SVG.IconMenuReport}
            label="Report"
          />
        )}
      </View>
      {canDelete && (
        <MenuItem
          onPress={onDelete}
          Icon={SVG.IconMenuDelete}
          label="Delete"
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
  groupMenu: {
    borderRadius: 5,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(MenuMessage);
