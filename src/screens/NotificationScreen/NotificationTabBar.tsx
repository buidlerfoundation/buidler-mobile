import {MaterialTopTabBarProps} from '@react-navigation/material-top-tabs';
import {
  MaterialTopTabDescriptorMap,
  MaterialTopTabNavigationEventMap,
} from '@react-navigation/material-top-tabs/lib/typescript/src/types';
import {
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from '@react-navigation/native';
import AppStyles from 'common/AppStyles';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useMemo} from 'react';
import {
  Animated,
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';

type TabBarItemProps = {
  descriptors: MaterialTopTabDescriptorMap;
  route: any;
  state: TabNavigationState<ParamListBase>;
  index: number;
  navigation: NavigationHelpers<
    ParamListBase,
    MaterialTopTabNavigationEventMap
  >;
  position: any;
};

const TabBarItem = memo(
  ({
    descriptors,
    route,
    state,
    index,
    navigation,
    position,
  }: TabBarItemProps) => {
    const {colors} = useThemeColor();
    const {options} = useMemo(
      () => descriptors[route.key],
      [descriptors, route.key],
    );
    const label = useMemo(
      () =>
        options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name,
      [options.tabBarLabel, options.title, route.name],
    );

    const isFocused = useMemo(
      () => state.index === index,
      [index, state.index],
    );

    const onPress = useCallback(() => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        // The `merge: true` option makes sure that the params inside the tab screen are preserved
        navigation.navigate({name: route.name, merge: true});
      }
    }, [isFocused, navigation, route.key, route.name]);

    const onLongPress = useCallback(() => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    }, [navigation, route.key]);

    const inputRange = useMemo(
      () => state.routes.map((_, i) => i),
      [state.routes],
    );
    const inActiveOpacity = useMemo(
      () =>
        position.interpolate({
          inputRange,
          outputRange: inputRange.map(i => (i === index ? 0 : 1)),
        }),
      [index, inputRange, position],
    );
    const opacity = useMemo(
      () =>
        position.interpolate({
          inputRange,
          outputRange: inputRange.map(i => (i === index ? 1 : 0)),
        }),
      [index, inputRange, position],
    );

    return (
      <Touchable
        accessibilityRole="button"
        accessibilityState={isFocused ? {selected: true} : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.tabItem]}
        useReactNative>
        <Animated.Text
          style={[
            AppStyles.TextMed15,
            {opacity: inActiveOpacity, color: colors.subtext},
          ]}>
          {label}
        </Animated.Text>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}>
          <Text
            style={[
              AppStyles.TextMed15,
              {
                color: colors.text,
              },
            ]}>
            {label}
          </Text>
        </Animated.View>
      </Touchable>
    );
  },
);

const NotificationTabBar = ({
  state,
  descriptors,
  navigation,
  position,
}: MaterialTopTabBarProps) => {
  const {colors} = useThemeColor();
  const {width} = useWindowDimensions();
  const tabWidth = useMemo(
    () => Math.floor((width - 48) / state.routes.length),
    [state.routes.length, width],
  );
  const inputRange = useMemo(
    () => state.routes.map((_, i) => i),
    [state.routes],
  );
  const translateX = useMemo(
    () =>
      position.interpolate({
        inputRange,
        outputRange: inputRange.map(i => tabWidth * i),
      }),
    [inputRange, position, tabWidth],
  );
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.activeBackgroundLight},
      ]}>
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth,
            transform: [{translateX}],
            backgroundColor: colors.activeBackground,
          },
        ]}
      />
      {state.routes.map((route, index) => (
        <TabBarItem
          key={route.key}
          route={route}
          index={index}
          descriptors={descriptors}
          navigation={navigation}
          position={position}
          state={state}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    height: 42,
    padding: 4,
    borderRadius: 6,
    flexDirection: 'row',
    marginBottom: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 5,
  },
});

export default memo(NotificationTabBar);
