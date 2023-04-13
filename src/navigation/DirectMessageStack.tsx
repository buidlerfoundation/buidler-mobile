import React, {memo, useCallback, useEffect} from 'react';
import ScreenID from 'common/ScreenID';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation, useRoute} from '@react-navigation/native';
import DirectMessageScreen from 'screens/DirectMessageScreen';

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
      initialRouteName={ScreenID.DirectMessageScreen}
      screenOptions={screenOptions}>
      <Stack.Screen
        name={ScreenID.DirectMessageScreen}
        component={DirectMessageScreen}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
};

export default memo(DirectMessageStack);
