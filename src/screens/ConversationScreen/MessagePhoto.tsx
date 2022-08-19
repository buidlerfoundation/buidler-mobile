import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import ImageAutoSize from 'components/ImageAutoSize';
import ImageLightBox from 'components/ImageLightBox';
import Touchable from 'components/Touchable';
import ImageHelper from 'helpers/ImageHelper';
import {AttachmentData} from 'models';
import React, {memo, useCallback} from 'react';
import {View, StyleSheet, Text, Linking, Platform} from 'react-native';
import Video from 'react-native-video';
import useThemeColor from 'hook/useThemeColor';

type AttachmentItemProps = {
  att: AttachmentData;
  onPress: (att: AttachmentData) => void;
  teamId: string;
};

const AttachmentItem = ({att, onPress, teamId}: AttachmentItemProps) => {
  const {colors} = useThemeColor();
  const onFilePress = useCallback(() => onPress(att), [att, onPress]);
  if (att.mimetype.includes('video')) {
    return (
      <Video
        source={{uri: ImageHelper.normalizeImage(att.file_url, teamId)}}
        style={{width: '100%', height: 150, marginTop: 10}}
        controls={Platform.OS === 'ios'}
        paused
        resizeMode="contain"
        key={att.file_id}
      />
    );
  }
  if (att.mimetype.includes('application')) {
    return (
      <Touchable
        style={[
          styles.fileItem,
          {backgroundColor: colors.activeBackgroundLight},
        ]}
        onPress={onFilePress}
        key={att.file_id}>
        <SVG.IconFile fill={colors.subtext} />
        <Text style={[styles.fileName, {color: colors.text}]}>
          {att.original_name}
        </Text>
        <SVG.IconDownload fill={colors.subtext} />
      </Touchable>
    );
  }
  return (
    <View style={styles.photoItem} key={att.file_id}>
      <ImageLightBox
        originUrl={ImageHelper.normalizeImage(att.file_url, teamId)}>
        <ImageAutoSize
          url={ImageHelper.normalizeImage(att.file_url, teamId, {h: 90})}
          maxHeight={90}
          maxWidth={275}
          resizeMode="contain"
        />
      </ImageLightBox>
    </View>
  );
};

type MessagePhotoProps = {
  attachments: Array<AttachmentData>;
  teamId: string;
};

const MessagePhoto = ({attachments, teamId}: MessagePhotoProps) => {
  const onFilePress = useCallback(
    (att: AttachmentData) => {
      Linking.openURL(
        ImageHelper.normalizeImage(att.file_url, teamId, {}, true),
      );
    },
    [teamId],
  );
  return (
    <View style={styles.container}>
      {attachments.map(att => {
        return (
          <AttachmentItem
            att={att}
            key={att.file_id}
            onPress={onFilePress}
            teamId={teamId}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  photoItem: {
    marginTop: 10,
    marginRight: 10,
  },
  fileItem: {
    marginTop: 10,
    marginRight: 10,
    padding: 10,
    flexDirection: 'row',
    borderRadius: 5,
  },
  fileName: {
    marginHorizontal: 16,
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.Medium,
  },
});

export default memo(MessagePhoto);
