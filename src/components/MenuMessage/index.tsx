import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import AppDimension from 'common/AppDimension';

type MenuMessageProps = {
  onReply: () => void;
  onEdit: () => void;
  canEdit: boolean;
  onPin?: () => void;
  canPin: boolean;
  onCopyMessage: () => void;
  canDelete: boolean;
  onDelete: () => void;
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
}: MenuMessageProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
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

export default memo(MenuMessage);
