import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';

type MenuMessageProps = {
  onCreateTask: () => void;
  onReply: () => void;
  onEdit: () => void;
  canEdit: boolean;
};

const MenuMessage = ({
  onCreateTask,
  onEdit,
  onReply,
  canEdit,
}: MenuMessageProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Touchable style={styles.menuItem} onPress={onCreateTask}>
        <SVG.IconCheckCreateTask stroke={colors.text} />
        <Text style={[styles.menuLabel, {color: colors.text}]}>Add Task</Text>
      </Touchable>
      <Touchable style={styles.menuItem} onPress={onReply}>
        <SVG.IconReply stroke={colors.text} />
        <Text style={[styles.menuLabel, {color: colors.text}]}>Reply</Text>
      </Touchable>
      {canEdit && (
        <Touchable style={styles.menuItem} onPress={onEdit}>
          <SVG.IconEdit stroke={colors.text} />
          <Text style={[styles.menuLabel, {color: colors.text}]}>
            Edit Message
          </Text>
        </Touchable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuLabel: {
    marginLeft: 16,
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.Medium,
  },
});

export default memo(MenuMessage);
