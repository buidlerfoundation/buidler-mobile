import React, {memo, useCallback, useState} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';
import {Drawer} from 'components/RNDrawerLayout';

const ConversationDrawerScreen = () => {
  const [openLeft, setOpenLeft] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const onOpenLeft = useCallback(() => setOpenLeft(true), []);
  const onCloseLeft = useCallback(() => setOpenLeft(false), []);
  const onOpenRight = useCallback(() => setOpenRight(true), []);
  const onCloseRight = useCallback(() => setOpenRight(false), []);
  const {width} = useWindowDimensions();
  return (
    <Drawer
      renderDrawerContent={() => {
        return (
          <View style={{flex: 1, backgroundColor: 'yellow'}}>
            <Text>Drawer content</Text>
          </View>
        );
      }}
      renderDrawerContentRight={() => {
        return (
          <View style={{flex: 1, backgroundColor: 'cyan'}}>
            <Text>Drawer content right</Text>
          </View>
        );
      }}
      drawerType="back"
      open={openLeft}
      onOpen={onOpenLeft}
      onClose={onCloseLeft}
      openRight={openRight}
      onOpenRight={onOpenRight}
      onCloseRight={onCloseRight}
      swipeMinDistance={0.1}
      swipeEdgeWidth={width}
      drawerStyle={{width: width - 80}}>
      <View style={styles.container} />
    </Drawer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'plum',
  },
});

export default memo(ConversationDrawerScreen);
