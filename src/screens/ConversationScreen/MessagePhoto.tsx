import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import ImageAutoSize from 'components/ImageAutoSize';
import ImageLightBox from 'components/ImageLightBox';
import Touchable from 'components/Touchable';
import ImageHelper from 'helpers/ImageHelper';
import {Attachment, ThemeType} from 'models';
import React from 'react';
import {View, StyleSheet, Text, Linking, Platform} from 'react-native';
import themes from 'themes';
import Video from 'react-native-video';

type MessagePhotoProps = {
  themeType: ThemeType;
  attachments: Array<Attachment>;
  teamId: string;
};

const MessagePhoto = ({attachments, teamId, themeType}: MessagePhotoProps) => {
  const {colors} = themes[themeType];
  return (
    <View style={styles.container}>
      {attachments.map(att => {
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
              onPress={() => {
                Linking.openURL(
                  ImageHelper.normalizeImage(att.file_url, teamId, {}, true),
                );
              }}
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

export default MessagePhoto;
