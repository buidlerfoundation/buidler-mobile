import React, {useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Collapsible from 'react-native-collapsible';
import {useTheme} from '@react-navigation/native';
import Fonts from 'common/Fonts';
import {Channel, SpaceChannel} from 'models';
import Touchable from 'components/Touchable';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';
import SVG from 'common/SVG';

type SpaceItemProps = {
  item: SpaceChannel;
  channel: Array<Channel>;
  currentChannel: Channel;
  setCurrentChannel: (channel: Channel) => any;
};

const SpaceItem = ({
  item,
  channel,
  currentChannel,
  setCurrentChannel,
}: SpaceItemProps) => {
  const {colors} = useTheme();
  const [isCollapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed(!isCollapsed);
  return (
    <View
      style={[
        styles.space,
        {
          backgroundColor: colors.background,
          borderColor: isCollapsed ? colors.border : colors.background,
        },
      ]}>
      <Touchable style={styles.groupHead} onPress={toggleCollapsed}>
        <Text style={[styles.groupName, {color: colors.text}]}>
          {item.space_name}
        </Text>
      </Touchable>
      <Collapsible collapsed={isCollapsed} duration={400} easing="linear">
        {channel
          .filter(c => c.space_id === item.space_id)
          .map(c => {
            const isActive = currentChannel.channel_id === c.channel_id;
            return (
              <Touchable
                style={[
                  styles.channelItem,
                  isActive && {backgroundColor: colors.activeBackground},
                ]}
                key={c.channel_id}
                onPress={() => {
                  setCurrentChannel(c);
                  NavigationServices.pushToScreen(ScreenID.ConversationScreen);
                }}
                onLongPress={() => {
                  setCurrentChannel(c);
                  NavigationServices.pushToScreen(ScreenID.TaskScreen);
                }}>
                <Text
                  style={[
                    styles.channelName,
                    {
                      color: isActive || !c.seen ? colors.text : colors.subtext,
                    },
                  ]}>
                  {c.channel_type === 'Private' ? (
                    <SVG.IconPrivate
                      fill={isActive || !c.seen ? colors.text : colors.subtext}
                    />
                  ) : (
                    '#'
                  )}{' '}
                  {c.channel_name}
                </Text>
              </Touchable>
            );
          })}
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  space: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  groupName: {
    fontFamily: Fonts.Bold,
    fontSize: 20,
    lineHeight: 24,
  },
  channelItem: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    borderRadius: 5,
  },
  channelName: {
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    lineHeight: 19,
  },
});

export default SpaceItem;
