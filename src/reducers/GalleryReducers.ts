import {actionTypes} from 'actions/actionTypes';
import {AnyAction, Reducer} from 'redux';
import {PhotoIdentifier} from '@react-native-camera-roll/camera-roll';

type Album = {
  name: string;
  count: number;
  uri: string;
  data: PhotoIdentifier[];
};

type GalleryReducerState = {
  albums: Album[];
  currentAlbum?: Album;
};

const initialState: GalleryReducerState = {
  albums: [],
};

const galleryReducers: Reducer<GalleryReducerState, AnyAction> = (
  state = initialState,
  action,
) => {
  const {type, payload} = action;
  switch (type) {
    case actionTypes.GET_PHOTO_ALBUMS: {
      return {
        ...state,
        albums: payload,
        currentAlbum: payload.find(el => el.name === 'Recents'),
      };
    }
    case actionTypes.GET_PHOTO_BY_ALBUM: {
      const {album, data} = payload;
      return {
        ...state,
        albums: state.albums.map(el => {
          if (el.name === album.name) {
            return {
              ...el,
              data: data.edges,
            };
          }
          return el;
        }),
      };
    }
    default:
      return state;
  }
};

export default galleryReducers;
