import {Dispatch} from 'redux';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import {actionTypes} from './actionTypes';

export const getPhotoAlbums = () => async (dispatch: Dispatch) => {
  const albums = await CameraRoll.getAlbums({albumType: 'All'});
  const albumDataWithUri = await Promise.all(
    albums.map(async album => {
      const photos = await CameraRoll.getPhotos({
        first: 1,
        groupName: album.title,
      });
      if (photos.edges.length > 0) {
        return {
          name: album.title,
          count: album.count,
          uri: photos.edges[0].node.image.uri,
          data: [],
        };
      }
    }),
  );
  dispatch({type: actionTypes.GET_PHOTO_ALBUMS, payload: albumDataWithUri});
};

export const getPhotoByAlbum = album => async (dispatch: Dispatch) => {
  const photos = await CameraRoll.getPhotos({
    first: album.count,
    groupName: album.name,
  });
  dispatch({
    type: actionTypes.GET_PHOTO_BY_ALBUM,
    payload: {data: photos, album},
  });
};
