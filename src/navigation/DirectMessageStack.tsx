import React, {memo, useCallback, useEffect} from 'react';
import {DrawerID} from 'common/ScreenID';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DirectMessageDrawer from './DirectMessageDrawer';
import {useNavigation, useRoute} from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const DirectMessageStack = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const header = useCallback(() => null, []);
  const screenOptions = useCallback(
    () => ({
      header,
    }),
    [header],
  );
  useEffect(() => {
    if (route.params?.child) {
      navigation.navigate(route.params?.child, route.params);
    }
  }, [navigation, route.params]);
  return (
    <Stack.Navigator
      initialRouteName={DrawerID.DirectMessageDrawer}
      screenOptions={screenOptions}>
      <Stack.Screen
        name={DrawerID.DirectMessageDrawer}
        component={DirectMessageDrawer}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
};

export default memo(DirectMessageStack);
