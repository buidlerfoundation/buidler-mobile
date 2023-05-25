import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import ImageLightBox from 'components/ImageLightBox';
import Touchable from 'components/Touchable';
import ImageHelper from 'helpers/ImageHelper';
import {AttachmentData} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Linking,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import useThemeColor from 'hook/useThemeColor';
import FastImage from 'react-native-fast-image';
import AppDimension from 'common/AppDimension';
import Video from 'react-native-video';
import Spinner from 'components/Spinner';

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
  disabled,
  contentId,
  allAttachments,
}: AttachmentItemProps) => {
  const {colors} = useThemeColor();
  const {width, height} = useWindowDimensions();
  const maxHeight = useMemo(
    () =>
      Math.round(
        (height - 172 - AppDimension.extraBottom - AppDimension.extraTop) / 2,
      ),
    [height],
  );
  const aspectRatioLocalFile = useMemo(() => {
    const localWidth = att.localFile?.width;
    const localHeight = att.localFile?.height;
    if (!localHeight || !localWidth) {
      return 1.667;
    }
    const imageHeight = (imageWidth * localHeight) / localWidth;
    return (
      Math.round((imageWidth / Math.min(imageHeight, maxHeight)) * 1000) / 1000
    );
  }, [att.localFile?.height, att.localFile?.width, imageWidth, maxHeight]);
  const aspectRatio = useMemo(() => {
    if (!att.height || !att.width) {
      return 1.667;
    }
    const imageHeight = (imageWidth * att.height) / att.width;
    return (
      Math.round((imageWidth / Math.min(imageHeight, maxHeight)) * 1000) / 1000
    );
  }, [att.height, att.width, imageWidth, maxHeight]);
  const renderLocalFile = useCallback(
    (localFile: any) => {
      if (localFile.type.includes('video')) {
        return (
          <Video
            source={{
              uri: localFile.uri,
            }}
            style={{
              borderRadius: 5,
              width: imageWidth,
              aspectRatio: aspectRatioLocalFile,
            }}
            paused
            resizeMode="cover"
          />
        );
      }
      return (
        <FastImage
          source={{
            uri: localFile.uri,
          }}
          style={{width: imageWidth, aspectRatio: aspectRatioLocalFile}}
        />
      );
    },
    [aspectRatioLocalFile, imageWidth],
  );
  const onFilePress = useCallback(() => onPress(att), [att, onPress]);
  if (att.is_uploaded === false) {
    if (att.localFile) {
      return (
        <View>
          {renderLocalFile(att.localFile)}
          <Spinner size="small" backgroundColor="#11111180" />
        </View>
      );
    }
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
          <Text
            style={[styles.fileName, {color: colors.text}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {att.original_name}
          </Text>
          <SVG.IconDownload fill={colors.subtext} />
        </Touchable>
        {stackAttachment > 1 && (
          <View style={styles.stackView}>
            <Text style={[styles.stackCount, {color: colors.text}]}>
              +{stackAttachment - 1}
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
        originUrl={ImageHelper.normalizeImage(att.file_url, teamId, {
          w: width,
        })}
        onLongPress={onLongPress}
        disabled={disabled}
        contentId={contentId}
        allAttachments={allAttachments}>
        <View>
          {!att?.mimetype?.includes('video') && (
            <FastImage
              source={{
                uri: att?.mimetype?.includes('video')
                  ? ImageHelper.normalizeImage(
                      att.file_url.replace(/\..*$/g, '_thumbnail.png'),
                      teamId,
                    )
                  : ImageHelper.normalizeImage(att.file_url, teamId, {
                      w: width,
                    }),
              }}
              style={[
                StyleSheet.absoluteFill,
                {width: imageWidth, aspectRatio, opacity: 0},
              ]}
              resizeMode="contain"
            />
          )}
          <FastImage
            source={{
              uri: att?.mimetype?.includes('video')
                ? ImageHelper.normalizeImage(
                    att.file_url.replace(/\..*$/g, '_thumbnail.png'),
                    teamId,
                  )
                : ImageHelper.normalizeImage(att.file_url, teamId, {
                    w: imageWidth,
                  }),
            }}
            style={{width: imageWidth, aspectRatio}}
          />
          {att?.mimetype?.includes('video') && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: 10,
                },
              ]}>
              <SVG.IconVideoPlay />
            </View>
          )}
        </View>
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
  const {width, height} = useWindowDimensions();
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
            style={{
              marginRight:
                index % 2 === 0 || index === attachmentData.length - 1 ? 10 : 0,
            }}
            stackAttachment={index === 1 ? morePhoto : undefined}
            onLongPress={onLongPress}
            isPinPost={isPinPost}
            disabled={disabled}
            contentId={contentId}
            allAttachments={
              contentId
                ? undefined
                : attachments
                    .filter(
                      el =>
                        el.mimetype?.includes('image') ||
                        el.mimetype?.includes('video'),
                    )
                    .map(el => ({
                      url: ImageHelper.normalizeImage(el.file_url, teamId, {
                        w: width,
                      }),
                      width,
                      height,
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
    width: '100%',
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
    flex: 1,
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
