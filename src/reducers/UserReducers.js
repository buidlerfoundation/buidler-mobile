import {actionTypes} from 'actions/actionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';

const initialState = {
  userData: null,
  team: null,
  channel: [],
  groupChannel: [],
  currentTeam: null,
  currentChannel: null,
  imgDomain: null,
  imgConfig: null,
  loginGoogleUrl: null,
  teamUserData: [],
  lastChannel: {},
};

const userReducers = (state = initialState, action) => {
  const {type, payload} = action;
  switch (type) {
    case actionTypes.USER_ONLINE: {
      const {user_id} = payload;
      return {
        ...state,
        teamUserData: state.teamUserData.map(el => {
          if (el.user_id === user_id) {
            el.status = 'online';
          }
          return el;
        }),
      };
    }
    case actionTypes.USER_OFFLINE: {
      const {user_id} = payload;
      return {
        ...state,
        teamUserData: state.teamUserData.map(el => {
          if (el.user_id === user_id) {
            el.status = 'offline';
          }
          return el;
        }),
      };
    }
    case actionTypes.GET_INITIAL: {
      return {
        ...state,
        imgDomain: payload.data.img_domain,
        imgConfig: payload.data.img_config,
        loginGoogleUrl: payload.data.login_url,
      };
    }
    case actionTypes.LOGOUT: {
      return {
        ...state,
        userData: null,
        team: null,
        channel: [],
        groupChannel: [],
        currentTeam: null,
        currentChannel: null,
        lastChannel: {},
      };
    }
    case actionTypes.GET_TEAM_USER: {
      const {teamUsers} = payload;
      return {
        ...state,
        teamUserData: teamUsers,
      };
    }
    case actionTypes.USER_SUCCESS: {
      return {
        ...state,
        userData: payload.user,
      };
    }
    case actionTypes.GROUP_CHANNEL: {
      return {
        ...state,
        groupChannel: payload,
      };
    }
    case actionTypes.SET_CURRENT_TEAM: {
      const {lastChannelId, resChannel, directChannelUser, team} = payload;
      let channel;
      if (directChannelUser && lastChannelId) {
        channel = {
          channel_id: lastChannelId,
          channel_name: '',
          channel_type: 'Direct',
          seen: true,
          user: directChannelUser,
        };
      } else if (resChannel.data.length > 0) {
        channel =
          resChannel.data.find(c =>
            lastChannelId
              ? c.channel_id === lastChannelId
              : c.channel_id === state.lastChannel?.[team.team_id]?.channel_id,
          ) || resChannel.data.filter(c => c.channel_type !== 'Direct')[0];
      }
      AsyncStorage.setItem(AsyncKey.lastChannelId, channel.channel_id);
      return {
        ...state,
        currentTeam: team,
        currentChannel: channel,
        lastChannel: {
          ...state.lastChannel,
          [team.team_id]: channel,
        },
      };
    }
    case actionTypes.MARK_UN_SEEN_CHANNEL: {
      const {channelId} = payload;
      return {
        ...state,
        channel: state.channel.map(c => {
          if (c.channel_id === channelId) {
            c.seen = false;
          }
          return c;
        }),
      };
    }
    case actionTypes.SET_CURRENT_CHANNEL: {
      return {
        ...state,
        currentChannel: payload.channel,
        lastChannel: {
          ...state.lastChannel,
          [state.currentTeam.team_id]: payload.channel,
        },
        channel: state.channel.map(c => {
          if (c.channel_id === payload.channel.channel_id) {
            c.seen = true;
          }
          return c;
        }),
      };
    }
    case actionTypes.TEAM_SUCCESS: {
      return {
        ...state,
        team: payload.team,
      };
    }
    case actionTypes.CHANNEL_SUCCESS: {
      return {
        ...state,
        channel: payload.channel,
      };
    }
    case actionTypes.CREATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        channel: [...state.channel, payload],
      };
    }
    case actionTypes.NEW_USER: {
      return {
        ...state,
        teamUserData: [...state.teamUserData, payload],
      };
    }
    case actionTypes.NEW_CHANNEL: {
      let newTeamUserData = state.teamUserData;
      const {currentChannel} = state;
      if (payload.channel_type === 'Direct') {
        newTeamUserData = newTeamUserData.map(el => {
          if (
            !!payload.channel_member.find(id => id === el.user_id) &&
            (el.user_id !== state.userData.user_id ||
              payload.channel_member.length === 1)
          ) {
            el.direct_channel = payload.channel_id;
          }
          return el;
        });
        if (
          payload.channel_member.find(el => el === currentChannel.user?.user_id)
        ) {
          currentChannel.channel_id = payload.channel_id;
        }
      }
      return {
        ...state,
        channel: [...state.channel, payload],
        teamUserData: newTeamUserData,
        currentChannel,
      };
    }
    case actionTypes.UPDATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        channel: state.channel.map(el => {
          if (el.channel_id === payload.channel_id) {
            return {...el, ...payload};
          }
          return el;
        }),
        currentChannel:
          state.currentChannel.channel_id === payload.channel_id
            ? {...state.currentChannel, ...payload}
            : state.currentChannel,
      };
    }
    case actionTypes.DELETE_CHANNEL_SUCCESS: {
      const {currentChannel, channel} = state;
      const currentIdx = channel.findIndex(
        el => el.channel_id === currentChannel.channel_id,
      );
      const newChannel = channel.filter(
        el => el.channel_id !== payload.channelId,
      );
      let newCurrentChannel = currentChannel;
      if (currentChannel.channel_id === payload.channelId) {
        newCurrentChannel = newChannel?.[currentIdx] || newChannel?.[0];
        AsyncStorage.setItem(
          AsyncKey.lastChannelId,
          newCurrentChannel?.channel_id,
        );
      }
      return {
        ...state,
        channel: newChannel,
        currentChannel: newCurrentChannel,
      };
    }
    default:
      return state;
  }
};

export default userReducers;
