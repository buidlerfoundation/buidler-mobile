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
      const {teamUsers, teamId} = payload;
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
    default:
      return state;
  }
};

export default userReducers;
