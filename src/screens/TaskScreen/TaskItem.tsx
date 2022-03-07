import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {Channel, ReactData, Task, ThemeType} from 'models';
import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import themes from 'themes';
import ImageHelper from 'helpers/ImageHelper';
import ImageAutoSize from 'components/ImageAutoSize';
import ReactView from 'components/ReactView';
import ImageLightBox from 'components/ImageLightBox';
import HapticUtils from 'utils/HapticUtils';
import RenderHTML from 'components/RenderHTML';
import {normalizeMessageText} from 'helpers/MessageHelper';

type TaskItem = {
  task: Task;
  themeType: ThemeType;
  teamId: string;
  reacts: Array<ReactData>;
  onUpdateStatus: (task: Task) => void;
  onPressTask: () => void;
  setCurrentChannel?: (channel: Channel) => any;
};

const TaskItem = ({
  task,
  themeType,
  teamId,
  reacts,
  onUpdateStatus,
  onPressTask,
  setCurrentChannel,
}: TaskItem) => {
  const {colors} = themes[themeType];
  const onCheckPress = (task: Task) => () => {
    HapticUtils.trigger();
    onUpdateStatus(task);
  };
  const renderStatusIcon = () => {
    if (task.status === 'todo') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress(task)}>
          <SVG.IconCheckOutLine stroke={colors.subtext} />
        </Touchable>
      );
    }
    if (task.status === 'doing') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress(task)}>
          <SVG.IconCheckDoing />
        </Touchable>
      );
    }
    if (task.status === 'done') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress(task)}>
          <SVG.IconCheckDone />
        </Touchable>
      );
    }
    if (task.status === 'archived') {
      return (
        <Touchable style={{padding: 10}} onPress={onCheckPress(task)}>
          <SVG.IconCheckArchived />
        </Touchable>
      );
    }
  };
  return (
    <View style={styles.container}>
      {renderStatusIcon()}
      <Touchable style={styles.taskBody} onPress={onPressTask}>
        <RenderHTML
          html={`<div class='task-text ${
            task.status === 'archived' && 'task-archived'
          }'>${normalizeMessageText(task.title)}</div>`}
          setCurrentChannel={setCurrentChannel}
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
          <ReactView
            themeType={themeType}
            reacts={reacts}
            style={{marginTop: 15}}
          />
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

export default TaskItem;
