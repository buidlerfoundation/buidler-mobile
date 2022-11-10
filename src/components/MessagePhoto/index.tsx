import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import ImageLightBox from 'components/ImageLightBox';
import Touchable from 'components/Touchable';
import ImageHelper from 'helpers/ImageHelper';
import {AttachmentData} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text, Linking, ViewStyle} from 'react-native';
import Video from 'react-native-video';
import useThemeColor from 'hook/useThemeColor';
import FastImage from 'react-native-fast-image';

type AttachmentItemProps = {
  att: AttachmentData;
  onPress: (att: AttachmentData) => void;
  teamId: string;
  imageWidth?: number;
  style?: ViewStyle;
  stackAttachment?: number;
  onLongPress?: () => void;
  isPinPost?: boolean;
  disabled?: boolean;
  contentId?: string;
  allAttachments?: any[];
};

const AttachmentItem = ({
  att,
  onPress,
  teamId,
  imageWidth = 100,
  style,
  stackAttachment,
  onLongPress,
  isPinPost,
  disabled,
  contentId,
  allAttachments,
}: AttachmentItemProps) => {
  const {colors} = useThemeColor();
  const onFilePress = useCallback(() => onPress(att), [att, onPress]);
  if (att.is_uploaded === false) {
    return (
      <View
        style={[
          styles.photoItem,
          style,
          {
            backgroundColor: colors.backgroundHeader,
            width: imageWidth,
            height: Math.round(imageWidth / 1.667),
          },
        ]}
      />
    );
  }
  if (att?.mimetype?.includes('video')) {
    return (
      <View
        style={[styles.photoItem, {backgroundColor: colors.backgroundHeader}]}
        key={att.file_id}>
        <Touchable useReactNative onLongPress={onLongPress} disabled={disabled}>
          <Video
            source={{uri: ImageHelper.normalizeImage(att.file_url, teamId)}}
            style={
              isPinPost
                ? {width: '100%', aspectRatio: 1.667}
                : {
                    width: imageWidth,
                    height: Math.round(imageWidth / 1.667),
                  }
            }
            paused
            controls
            resizeMode="contain"
            key={att.file_id}
          />
        </Touchable>
        {stackAttachment > 0 && (
          <View style={styles.stackView}>
            <Text style={[styles.stackCount, {color: colors.text}]}>
              +{stackAttachment}
            </Text>
          </View>
        )}
      </View>
    );
  }
  if (att?.mimetype?.includes('application')) {
    return (
      <View
        style={[
          styles.fileItemWrap,
          {backgroundColor: colors.activeBackgroundLight},
        ]}>
        <Touchable
          onPress={onFilePress}
          key={att.file_id}
          useReactNative
          onLongPress={onLongPress}
          disabled={disabled}
          style={styles.fileItem}>
          <SVG.IconFile fill={colors.subtext} />
          <Text style={[styles.fileName, {color: colors.text}]}>
            {att.original_name}
          </Text>
          <SVG.IconDownload fill={colors.subtext} />
        </Touchable>
        {stackAttachment > 0 && (
          <View style={styles.stackView}>
            <Text style={[styles.stackCount, {color: colors.text}]}>
              +{stackAttachment}
            </Text>
          </View>
        )}
      </View>
    );
  }
  return (
    <View
      style={[
        styles.photoItem,
        style,
        {backgroundColor: colors.backgroundHeader},
      ]}>
      <ImageLightBox
        originUrl={ImageHelper.normalizeImage(att.file_url, teamId)}
        onLongPress={onLongPress}
        disabled={disabled}
        contentId={contentId}
        allAttachments={allAttachments}>
        <FastImage
          source={{
            uri: ImageHelper.normalizeImage(att.file_url, teamId, {h: 90}),
          }}
          style={{width: imageWidth, aspectRatio: 1.667}}
          resizeMode="contain"
        />
      </ImageLightBox>
      {stackAttachment > 0 && (
        <View style={styles.stackView}>
          <Text style={[styles.stackCount, {color: colors.text}]}>
            +{stackAttachment}
          </Text>
        </View>
      )}
    </View>
  );
};

type MessagePhotoProps = {
  attachments: Array<AttachmentData>;
  teamId: string;
  style?: ViewStyle;
  imageWidth?: number;
  edited?: boolean;
  stack?: boolean;
  onLongPress?: () => void;
  isPinPost?: boolean;
  disabled?: boolean;
  contentId?: string;
};

const MessagePhoto = ({
  attachments,
  teamId,
  style,
  imageWidth = 100,
  edited,
  stack,
  isPinPost,
  onLongPress,
  disabled,
  contentId,
}: MessagePhotoProps) => {
  const {colors} = useThemeColor();
  const onFilePress = useCallback(
    (att: AttachmentData) => {
      Linking.openURL(
        ImageHelper.normalizeImage(att.file_url, teamId, {}, true),
      );
    },
    [teamId],
  );
  const morePhoto = useMemo(() => {
    if (stack) return attachments?.length - 2;
    return 0;
  }, [attachments?.length, stack]);
  const attachmentData = useMemo(() => {
    if (stack) return attachments?.slice?.(0, 2);
    return attachments;
  }, [attachments, stack]);
  if (!attachments || attachments.length === 0) return null;
  return (
    <View style={[styles.container, style]}>
      {attachmentData.map((att, index) => {
        return (
          <AttachmentItem
            att={att}
            key={att.file_id}
            onPress={onFilePress}
            teamId={teamId}
            imageWidth={Math.min(imageWidth, 300)}
            style={{marginRight: index % 2 === 0 ? 10 : 0}}
            stackAttachment={index === 1 ? morePhoto : undefined}
            onLongPress={onLongPress}
            isPinPost={isPinPost}
            disabled={disabled}
            contentId={contentId}
            allAttachments={
              contentId
                ? undefined
                : attachments
                    .filter(el => el.mimetype?.includes('image'))
                    .map(el => ({
                      url: ImageHelper.normalizeImage(el.file_url, teamId),
                    }))
            }
          />
        );
      })}
      {edited && (
        <Text style={[styles.edited, {color: colors.subtext}]}>edited</Text>
      )}
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
    borderRadius: 5,
    overflow: 'hidden',
  },
  fileItemWrap: {
    marginTop: 10,
  },
  fileItem: {
    padding: 10,
    flexDirection: 'row',
    borderRadius: 5,
    alignItems: 'center',
  },
  fileName: {
    marginHorizontal: 16,
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.Medium,
  },
  edited: {
    fontFamily: Fonts.Medium,
    fontSize: 12,
    lineHeight: 20,
    alignSelf: 'flex-end',
  },
  stackView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: '#000000BF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackCount: {
    fontFamily: Fonts.Bold,
    fontSize: 20,
    lineHeight: 24,
  },
});

export default memo(MessagePhoto);
