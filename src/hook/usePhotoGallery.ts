import {useMemo} from 'react';
import useAppSelector from './useAppSelector';

const usePhotoGallery = () => {
  const currentAlbum = useAppSelector(state => state.gallery.currentAlbum);
  const albums = useAppSelector(state => state.gallery.albums);
  return useMemo(
    () => albums.find(el => el.name === currentAlbum?.name)?.data || [],
    [albums, currentAlbum?.name],
  );
};

export default usePhotoGallery;
