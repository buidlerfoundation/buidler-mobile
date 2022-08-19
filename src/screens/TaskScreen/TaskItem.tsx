import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {ReactReducerData, TaskData} from 'models';
import React, {memo, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import ImageHelper from 'helpers/ImageHelper';
import ImageAutoSize from 'components/ImageAutoSize';
import ReactView from 'components/ReactView';
import ImageLightBox from 'components/ImageLightBox';
import HapticUtils from 'utils/HapticUtils';
import RenderHTML from 'components/RenderHTML';
import {normalizeMessageText} from 'helpers/MessageHelper';
import useThemeColor from 'hook/useThemeColor';

type TaskItem = {
  task: TaskData;
  teamId: string;
  reacts: Array<ReactReducerData>;
  onUpdateStatus: (task: TaskData) => void;
  onPressTask: (task: TaskData) => void;
};

const TaskItem = ({
  task,
  teamId,
  reacts,
  onUpdateStatus,
  onPressTask,
}: TaskItem) => {
  const {colors} = useThemeColor();
  const onCheckPress = useCallback(() => {
    HapticUtils.trigger();
    onUpdateStatus(task);
  }, [onUpdateStatus, task]);
  const renderStatusIcon = useCallback(() => {
    if (task.status === 'todo') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress}>
          <SVG.IconCheckOutLine stroke={colors.subtext} />
        </Touchable>
      );
    }
    if (task.status === 'doing') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress}>
          <SVG.IconCheckDoing />
        </Touchable>
      );
    }
    if (task.status === 'done') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress}>
          <SVG.IconCheckDone />
        </Touchable>
      );
    }
    if (task.status === 'archived') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress}>
          <SVG.IconCheckArchived />
        </Touchable>
      );
    }
  }, [colors.subtext, onCheckPress, task.status]);
  const handlePressTask = useCallback(
    () => onPressTask(task),
    [onPressTask, task],
  );
  return (
    <View style={styles.container}>
      {renderStatusIcon()}
      <Touchable style={styles.taskBody} onPress={handlePressTask}>
        <RenderHTML
          html={`<div class='task-text ${
            task.status === 'archived' && 'task-archived'
          }'>${normalizeMessageText(task.title)}</div>`}
        />
        {task.task_attachment.length > 0 && (
          <ImageLightBox
            originUrl={ImageHelper.normalizeImage(
              task.task_attachment?.[0].file_url,
              teamId,
            )}>
            <ImageAutoSize
              style={{marginTop: 15}}
              url={ImageHelper.normalizeImage(
                task.task_attachment?.[0].file_url,
                teamId,
                {
                  h: 120,
                },
              )}
              maxHeight={120}
              maxWidth={275}
            />
          </ImageLightBox>
        )}
        {reacts?.length > 0 && (
          <ReactView reacts={reacts} style={{marginTop: 15}} />
        )}
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  taskTitle: {
    fontFamily: Fonts.Medium,
    fontSize: 16,
    lineHeight: 26,
  },
  taskBody: {
    marginLeft: 10,
    flex: 1,
    paddingTop: 5,
  },
});

export default memo(TaskItem);
