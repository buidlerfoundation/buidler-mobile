import React, {memo} from 'react';
import ConversationScreen from 'screens/ConversationScreen';

const DirectMessageScreen = () => {
  return <ConversationScreen direct />;
};

export default memo(DirectMessageScreen);
