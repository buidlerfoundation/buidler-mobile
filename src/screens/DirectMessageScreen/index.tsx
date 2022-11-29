import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {memo, useCallback} from 'react';
import ConversationScreen from 'screens/ConversationScreen';

const DirectMessageScreen = () => {
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      navigation.closeDrawer();
    }, [navigation]),
  );
  return <ConversationScreen direct />;
};

export default memo(DirectMessageScreen);
