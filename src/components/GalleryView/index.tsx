import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react';
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
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import Touchable from 'components/Touchable';
import PermissionHelper from 'helpers/PermissionHelper';
import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';

type PhotoItemProps = {
  item: any;
  onSelect: (images: Array<any>) => void;
  index: number;
  imageSize: number;
};

const PhotoItem = ({item, onSelect, index, imageSize}: PhotoItemProps) => {
  const handlePress = useCallback(
    () => onSelect([item.node.image]),
    [item.node.image, onSelect],
  );
  return (
    <Touchable onPress={handlePress}>
      <Image
        style={{
          width: imageSize,
          height: imageSize,
          marginHorizontal: (index - 1) % 3 === 0 ? 3 : 0,
        }}
        source={{uri: item.node.image.uri}}
      />
    </Touchable>
  );
};

type GalleryViewProps = {
  useFlatList?: boolean;
  onSelectPhoto: (photos: Array<any>) => void;
  isOpen?: boolean;
};

const GalleryView = ({
  useFlatList,
  onSelectPhoto,
  isOpen = true,
}: GalleryViewProps) => {
  const ListComponent = useCallback(
    (props: FlatListProps<any>) => {
      if (useFlatList) return <FlatList {...props} />;
      return <BottomSheetFlatList {...props} />;
    },
    [useFlatList],
  );
  const actionSheetRef = useRef<ActionSheet>();
  const {width} = useWindowDimensions();
  const imageSize = useMemo(() => (width - 6) / 3, [width]);
  const {colors} = useThemeColor();
  const [pageInfo, setPageInfo] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isLimited, setLimited] = useState(false);
  const getData = useCallback((after?: string) => {
    PermissionHelper.checkLimitPhotoIOS().then(res => setLimited(res));
    CameraRoll.getPhotos({
      first: 20,
      after,
      assetType: 'Photos',
    })
      .then(res => {
        if (res.edges.length > 0) {
          setPhotos(current => [...current, ...res.edges]);
          setPageInfo(res.page_info);
        }
      })
      .catch(e => console.log(e));
  }, []);
  useEffect(() => {
    if (isOpen) getData();
  }, [getData, isOpen]);
  const onEndReached = useCallback(() => {
    if (pageInfo?.has_next_page) {
      getData(pageInfo?.end_cursor);
    }
  }, [getData, pageInfo?.end_cursor, pageInfo?.has_next_page]);
  const onMorePress = useCallback(() => actionSheetRef.current?.show(), []);
  const onSelect = useCallback(index => {
    if (index === 0) {
      PermissionHelper.openSelectPhoto();
    } else if (index === 1) {
      PermissionHelper.openPhotoSetting();
    }
  }, []);
  return (
    <>
      <ListComponent
        keyboardShouldPersistTaps="handled"
        data={isLimited ? [{type: 'select-photo'}, ...photos] : photos}
        keyExtractor={(item, index) => item?.node?.image?.uri || `${index}`}
        numColumns={3}
        ItemSeparatorComponent={() => <View style={{width: 3, height: 3}} />}
        onEndReachedThreshold={0.5}
        onEndReached={onEndReached}
        renderItem={({item, index}) => {
          if (item.type === 'select-photo') {
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
                onPress={onMorePress}>
                <Text style={[styles.selectText, {color: colors.text}]}>
                  Select more photos
                </Text>
              </Touchable>
            );
          }
          return (
            <PhotoItem
              item={item}
              index={index}
              onSelect={onSelectPhoto}
              imageSize={imageSize}
            />
          );
        }}
        style={{backgroundColor: colors.background}}
      />
      <ActionSheet
        ref={actionSheetRef}
        title="Select more photos or go to Settings to allow access to all photos"
        options={['Select More Photos', 'Allow Access to All Photos', 'Cancel']}
        cancelButtonIndex={2}
        onPress={onSelect}
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

export default memo(GalleryView);
