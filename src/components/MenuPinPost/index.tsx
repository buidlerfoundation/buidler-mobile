import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';

type MenuPinPostProps = {
  onReply: () => void;
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
};

const MenuPinPost = ({
  onReply,
  onUploadToIPFS,
  onCopyMessage,
  onCopyPostLink,
  onArchive,
  onUnarchive,
  onDelete,
  canUploadToIPFS,
  canArchive,
  canDelete,
  canUnarchive,
}: MenuPinPostProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Touchable style={styles.menuItem} onPress={onReply}>
        <SVG.IconMenuReply />
        <Text style={[styles.menuLabel, {color: colors.text}]}>Reply</Text>
      </Touchable>
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
      {canArchive && (
        <Touchable style={styles.menuItem} onPress={onArchive}>
          <SVG.IconMenuArchive />
          <Text style={[styles.menuLabel, {color: colors.text}]}>Archive</Text>
        </Touchable>
      )}
      {canUnarchive && (
        <Touchable style={styles.menuItem} onPress={onUnarchive}>
          <SVG.IconMenuUnarchive />
          <Text style={[styles.menuLabel, {color: colors.text}]}>
            Unarchive
          </Text>
        </Touchable>
      )}
      {canDelete && (
        <Touchable
          style={[
            styles.menuItem,
            {borderTopWidth: 1, borderColor: colors.border},
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
    marginHorizontal: 15,
    marginBottom: AppDimension.extraBottom + 15,
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
});

export default memo(MenuPinPost);
