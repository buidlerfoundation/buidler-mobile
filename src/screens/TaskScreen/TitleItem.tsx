import Fonts from 'common/Fonts';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {TaskData} from 'models';
import React, {memo, useMemo} from 'react';
import {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';

type TitleItemProps = {
  section: {
    title: string;
    data: Array<TaskData>;
    show: boolean;
  };
  onTitlePress: (title: string) => void;
  archivedCount: number;
};

const TitleItem = ({section, onTitlePress, archivedCount}: TitleItemProps) => {
  const {colors} = useThemeColor();
  const colorTitle = useMemo(
    () => ({
      todo: colors.todo,
      pinned: colors.todo,
      doing: colors.doing,
      done: colors.done,
      archived: colors.subtext,
    }),
    [colors.doing, colors.done, colors.subtext, colors.todo],
  );
  const handleTitlePress = useCallback(() => {
    onTitlePress(section.title);
  }, [onTitlePress, section.title]);
  return (
    <View
      style={{
        paddingHorizontal: 20,
        backgroundColor: colors.background,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <Touchable
        style={[
          styles.titleWrapper,
          {backgroundColor: colors.activeBackgroundLight},
        ]}
        onPress={handleTitlePress}>
        <Text style={[styles.titleText, {color: colorTitle[section.title]}]}>
          {section.title}
        </Text>
      </Touchable>
      {!section.show && (
        <Touchable
          style={[
            styles.taskCountWrapper,
            {backgroundColor: colors.activeBackgroundLight},
          ]}
          onPress={handleTitlePress}>
          <Text style={[styles.taskCountText, {color: colors.subtext}]}>
            {section.title === 'archived' ? archivedCount : section.data.length}
          </Text>
        </Touchable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titleText: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
    textTransform: 'capitalize',
  },
  titleWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  taskCountWrapper: {
    height: 30,
    minWidth: 18,
    borderRadius: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCountText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },
});

export default memo(TitleItem);
