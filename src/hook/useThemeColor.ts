import {useMemo} from 'react';
import themes from 'themes';
import useAppSelector from './useAppSelector';

const useThemeColor = () => {
  const themeType = useAppSelector(state => state.configs.theme);
  return useMemo(() => themes[themeType], [themeType]);
};

export default useThemeColor;
