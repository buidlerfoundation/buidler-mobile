import '@react-navigation/native';

// Override the theme in react native navigation to accept our custom theme props.
declare module '@react-navigation/native' {
  export type ExtendedTheme = {
    dark: boolean;
    colors: {
      primary: string;
      secondary: string;
      background: string;
      backgroundOverlay: string;
      backgroundHeader: string;
      card: string;
      text: string;
      subtext: string;
      lightText: string;
      separator: string;
      border: string;
      darkText: string;
      activeBackground: string;
      activeBackgroundLight: string;
      background80: string;
      success: string;
      urgent: string;
      mention: string;
      backgroundLight: string;
      notification: string;
      doing: string;
      todo: string;
      done: string;
      backdrop: string;
      backdropWithOpacity: string;
    };
  };
  export function useTheme(): ExtendedTheme;
}
