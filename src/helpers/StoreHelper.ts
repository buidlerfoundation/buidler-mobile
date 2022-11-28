import {Channel} from 'models';
import store from 'store';

const defaultChannel: Channel = {
  channel_id: '',
  channel_name: '',
  channel_type: 'Public',
  notification_type: '',
  seen: true,
};

export const getCommunityId = () => {
  if (!store) return '';
  return store.getState()?.user?.currentTeamId || '';
};

export const getChannelId = () => {
  if (!store) return '';
  return store.getState()?.user?.currentChannelId || '';
};

export const getDirectChannelId = () => {
  if (!store) return '';
  return store.getState()?.user?.currentDirectChannelId || '';
};

export const getCurrentCommunity = () => {
  if (!store) return null;
  let communityId = getCommunityId();
  const {team, currentTeamId} = store.getState().user;
  if (communityId === 'user' || !communityId) {
    communityId = currentTeamId;
  }
  return team?.find(el => el.team_id === communityId);
};

export const getCurrentChannel = (direct?: boolean) => {
  if (!store) return defaultChannel;
  const communityId = getCommunityId();
  const channelId = direct ? getDirectChannelId() : getChannelId();
  const {channelMap, directChannel} = store.getState().user;
  if (direct) return directChannel.find(el => el.channel_id === channelId);
  const channels = channelMap?.[communityId];
  return channels?.find(el => el.channel_id === channelId) || defaultChannel;
};
