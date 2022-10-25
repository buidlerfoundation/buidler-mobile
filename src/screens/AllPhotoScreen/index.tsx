import AppStyles from 'common/AppStyles';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import {StyleSheet, FlatList, useWindowDimensions, View} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import useAppDispatch from 'hook/useAppDispatch';
import {getPhotoAlbums, getPhotoByAlbum} from 'actions/GalleryActions';
import useAppSelector from 'hook/useAppSelector';
import usePhotoGallery from 'hook/usePhotoGallery';
import PhotoItem from 'components/PhotoItem';

const Tab = createMaterialTopTabNavigator();

type PhotoScreenProps = {
  type?: 'image' | 'video';
};

const PhotoScreen = memo(({type}: PhotoScreenProps) => {
  const photoGallery = usePhotoGallery();
  const {width} = useWindowDimensions();
  const imageSize = useMemo(() => (width - 4) / 3, [width]);
  const onSelectPhoto = useCallback(item => {}, []);
  const photoData = useMemo(() => {
    if (!type) return photoGallery;
    return photoGallery.filter(el => el.node.type === type);
  }, [photoGallery, type]);
  return (
    <FlatList
      style={styles.container}
      data={photoData}
      numColumns={3}
      keyExtractor={item => item.node.image.uri}
      ItemSeparatorComponent={() => <View style={{width: 2, height: 2}} />}
      renderItem={({item, index}) => (
        <PhotoItem
          item={item}
          index={index}
          onSelect={onSelectPhoto}
          imageSize={imageSize}
        />
      )}
    />
  );
});

const AllPhoto = memo(() => {
  return <PhotoScreen />;
});

const Photos = memo(() => {
  return <PhotoScreen type="image" />;
});

const Videos = memo(() => {
  return <PhotoScreen type="video" />;
});

const AllPhotoScreen = () => {
  const dispatch = useAppDispatch();
  const currentAlbum = useAppSelector(state => state.gallery.currentAlbum);
  const {colors} = useThemeColor();
  useEffect(() => {
    dispatch(getPhotoAlbums());
  }, [dispatch]);
  useEffect(() => {
    if (currentAlbum) {
      dispatch(getPhotoByAlbum(currentAlbum));
    }
  }, [currentAlbum, dispatch]);
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          height: 40,
        },
        tabBarLabelStyle: [AppStyles.TextSemi15, {textTransform: 'capitalize'}],
        tabBarInactiveTintColor: colors.subtext,
        tabBarActiveTintColor: colors.text,
        tabBarIndicator: () => null,
        tabBarItemStyle: {marginTop: -4},
      }}>
      <Tab.Screen name="All" component={AllPhoto} />
      <Tab.Screen name="Photos" component={Photos} />
      <Tab.Screen name="Videos" component={Videos} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default memo(AllPhotoScreen);
