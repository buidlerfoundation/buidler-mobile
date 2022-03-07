import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  Image,
  useWindowDimensions,
  View,
  FlatList,
  FlatListProps,
  Text,
} from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import CameraRoll from '@react-native-community/cameraroll';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {ThemeType} from 'models';
import themes from 'themes';
import Touchable from 'components/Touchable';
import SVG from 'common/SVG';
import PermissionHelper from 'helpers/PermissionHelper';
import Fonts from 'common/Fonts';

type GalleryViewProps = {
  themeType: ThemeType;
  useFlatList?: boolean;
  onSelectPhoto: (photos: Array<any>) => void;
  isOpen?: boolean;
};

const GalleryView = ({
  themeType,
  useFlatList,
  onSelectPhoto,
  isOpen = true,
}: GalleryViewProps) => {
  const ListComponent = (props: FlatListProps<any>) => {
    if (useFlatList) return <FlatList {...props} />;
    return <BottomSheetFlatList {...props} />;
  };
  const actionSheetRef = useRef<ActionSheet>();
  const imageSize = (useWindowDimensions().width - 6) / 3;
  const {colors} = themes[themeType];
  const [pageInfo, setPageInfo] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isLimited, setLimited] = useState(false);
  const getData = () => {
    PermissionHelper.checkLimitPhotoIOS().then(res => setLimited(res));
    CameraRoll.getPhotos({
      first: 20,
      after: pageInfo?.end_cursor,
      assetType: 'Photos',
    })
      .then(res => {
        setPhotos([...photos, ...res.edges]);
        setPageInfo(res.page_info);
      })
      .catch(e => console.log(e));
  };
  useEffect(() => {
    if (isOpen) getData();
  }, [isOpen]);
  return (
    <>
      <ListComponent
        keyboardShouldPersistTaps="handled"
        data={isLimited ? [{type: 'select-photo'}, ...photos] : photos}
        keyExtractor={(item, index) => item?.node?.image?.uri || `${index}`}
        numColumns={3}
        ItemSeparatorComponent={() => <View style={{width: 3, height: 3}} />}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (pageInfo?.has_next_page) {
            getData();
          }
        }}
        renderItem={({item, index}) => {
          // if (index === 0) {
          //   return (
          //     <Touchable
          //       style={{
          //         width: imageSize,
          //         height: imageSize,
          //         backgroundColor: colors.border,
          //         alignItems: 'center',
          //         justifyContent: 'center',
          //       }}>
          //       <View
          //         style={{
          //           alignItems: 'center',
          //           justifyContent: 'center',
          //           width: 50,
          //           height: 50,
          //           borderRadius: 25,
          //           backgroundColor: colors.activeBackground,
          //         }}>
          //         <SVG.IconCamera width={50} height={50} />
          //       </View>
          //     </Touchable>
          //   );
          // }
          if (index === 0) {
            return (
              <Touchable
                style={{
                  width: imageSize,
                  height: imageSize,
                  backgroundColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 20,
                }}
                onPress={() => actionSheetRef.current?.show()}>
                <Text style={[styles.selectText, {color: colors.text}]}>
                  Select more photos
                </Text>
              </Touchable>
            );
          }
          return (
            <Touchable onPress={() => onSelectPhoto([item.node.image])}>
              <Image
                style={{
                  width: imageSize,
                  height: imageSize,
                  marginHorizontal: (index - 1) % 3 == 0 ? 3 : 0,
                }}
                source={{uri: item.node.image.uri}}
              />
            </Touchable>
          );
        }}
        style={{backgroundColor: colors.background}}
      />
      <ActionSheet
        ref={actionSheetRef}
        title="Select more photos or go to Settings to allow access to all photos"
        options={['Select More Photos', 'Allow Access to All Photos', 'Cancel']}
        cancelButtonIndex={2}
        onPress={index => {
          if (index === 0) {
            PermissionHelper.openSelectPhoto();
          } else if (index === 1) {
            PermissionHelper.openPhotoSetting();
          }
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  selectText: {
    fontFamily: Fonts.Bold,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default GalleryView;
