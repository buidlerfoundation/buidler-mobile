import {actionTypes} from 'actions/actionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import {BalanceApiData, Channel, Community, Space, UserData} from 'models';
import {AnyAction, Reducer} from 'redux';
import {uniqBy} from 'lodash';

interface MemberRoleData {
  data: Array<UserData>;
  total: number;
  canMore: boolean;
  currentPage: number;
}

interface UserReducerState {
  userData: UserData;
  team?: Array<Community>;
  channelMap: {[key: string]: Array<Channel>};
  directChannel: Array<Channel>;
  spaceChannelMap: {[key: string]: Array<Space>};
  currentTeamId: string;
  currentChannelId: string;
  currentDirectChannelId: string;
  imgDomain: string;
  imgBucket: string;
  imgConfig: any;
  teamUserMap: {
    [key: string]: {
      data: Array<UserData>;
      total: number;
    };
  };
  directChannelUsers: UserData[];
  lastChannel: {[key: string]: Channel};
  spaceMembers: Array<UserData>;
  walletBalance?: BalanceApiData | null;
  memberData: {
    admin: MemberRoleData;
    owner: MemberRoleData;
    member: MemberRoleData;
  };
  apiTeamController?: AbortController | null;
  apiSpaceMemberController?: AbortController | null;
}

const defaultChannel: Channel = {
  channel_id: '',
  channel_name: '',
  channel_type: 'Public',
  notification_type: '',
  seen: true,
};

const initialState: UserReducerState = {
  userData: {
    avatar_url: '',
    user_id: '',
    user_name: '',
  },
  team: undefined,
  channelMap: {},
  directChannel: [],
  spaceChannelMap: {},
  currentTeamId: '',
  currentChannelId: '',
  currentDirectChannelId: '',
  imgDomain: '',
  imgBucket: '',
  imgConfig: {},
  teamUserMap: {},
  lastChannel: {},
  spaceMembers: [],
  directChannelUsers: [],
  walletBalance: null,
  memberData: {
    admin: {
      data: [],
      total: 0,
      canMore: false,
      currentPage: 1,
    },
    owner: {
      data: [],
      total: 0,
      canMore: false,
      currentPage: 1,
    },
    member: {
      data: [],
      total: 0,
      canMore: false,
      currentPage: 1,
    },
  },
  apiTeamController: null,
};

const userReducers: Reducer<UserReducerState, AnyAction> = (
  state = initialState,
  action,
) => {
  const {
    currentTeamId,
    teamUserMap,
    spaceChannelMap,
    walletBalance,
    memberData,
    channelMap,
    lastChannel,
    team,
    userData,
    directChannel,
    imgDomain,
    imgConfig,
    currentChannelId,
    imgBucket,
  } = state;
  const channelId = currentChannelId;
  const currentChannel =
    channelMap?.[currentTeamId]?.find(el => el.channel_id === channelId) ||
    defaultChannel;
  const {type, payload} = action;
  switch (type) {
    case actionTypes.SYNC_DIRECT_CHANNEL_DATA: {
      const {resDirectChannel, directChannelUsersRes} = payload;
      return {
        ...state,
        directChannel: resDirectChannel?.data || state.directChannel,
        directChannelUsers:
          directChannelUsersRes?.data || state.directChannelUsers,
      };
    }
    case actionTypes.RECEIVE_MESSAGE: {
      if (!payload.direct) {
        return state;
      }
      return {
        ...state,
        directChannel: state.directChannel.map(el => {
          if (el.channel_id === payload.data.entity_id) {
            return {
              ...el,
              updatedAt: new Date().toISOString(),
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.UPDATE_NOTIFICATION_CONFIG: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map(el => {
            if (
              payload.entity_type === 'channel' &&
              el.channel_id === payload.entity_id
            ) {
              return {...el, notification_type: payload.notification_type};
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_EXPAND_SPACE_ITEM: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map(el => {
            if (el.space_id === payload.spaceId) {
              el.isExpanded = payload.isExpand;
              return {...el};
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_LAST_CHANNEL: {
      const newLastChannel = channelMap?.[payload.communityId]?.find(
        el => el.channel_id === payload.channelId,
      );
      state.lastChannel = {
        ...state.lastChannel,
        [payload.communityId]: newLastChannel,
      };
      return state;
    }
    case actionTypes.MEMBER_DATA_SUCCESS: {
      const {role, page, data, total} = payload;
      memberData[role] = {
        data: page === 1 ? data : [...(memberData[role]?.data || []), ...data],
        total,
        canMore: data.length === 30,
        currentPage: page,
      };
      return {
        ...state,
        memberData: {...memberData},
      };
    }
    case actionTypes.ACCEPT_TEAM_SUCCESS: {
      return {
        ...state,
        team: uniqBy([...(team || []), payload], 'team_id'),
      };
    }
    case actionTypes.CLEAR_LAST_CHANNEL: {
      return {
        ...state,
        lastChannel: {
          ...lastChannel,
          [payload.communityId]: null,
        },
      };
    }
    case actionTypes.ADD_USER_TO_SPACE: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: [
            ...(channelMap[currentTeamId] || []),
            ...payload.channelFromSpace,
          ],
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map(el => {
            if (el.space_id === payload.space_id) {
              el.channel_ids = [
                ...(el.channel_ids || []),
                ...payload.channelFromSpace.map(c => c.channel_id),
              ];
              el.is_space_member = true;
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.REMOVE_USER_FROM_SPACE: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.filter(
            el => el.space_id !== payload.space_id,
          ),
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map(el => {
            if (el.space_id === payload.space_id) {
              el.channel_ids = [];
              el.is_space_member = false;
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.ADD_USER_TOKEN: {
      const newWalletBalance = walletBalance
        ? {
            ...walletBalance,
            tokens: [
              ...(walletBalance.tokens || []).filter(
                el =>
                  el.contract.contract_address !==
                  payload.contract.contract_address,
              ),
              payload,
            ],
          }
        : null;

      return {
        ...state,
        walletBalance: newWalletBalance,
      };
    }
    case actionTypes.WALLET_BALANCE_SUCCESS: {
      return {
        ...state,
        walletBalance: payload,
      };
    }
    case actionTypes.SPACE_MEMBER_REQUEST: {
      state.apiSpaceMemberController = payload.controller;
      return state;
    }
    case actionTypes.SPACE_MEMBER_SUCCESS: {
      state.spaceMembers = payload.data;
      state.apiSpaceMemberController = null;
      return state;
    }
    case actionTypes.UPDATE_USER_SUCCESS: {
      return {
        ...state,
        userData:
          payload.user_id === userData.user_id
            ? {
                ...userData,
                ...payload,
              }
            : userData,
        teamUserMap: {
          ...teamUserMap,
          [currentTeamId]: {
            data: teamUserMap[currentTeamId]?.data?.map(el => {
              if (el.user_id === payload.user_id) {
                return {
                  ...el,
                  ...payload,
                };
              }
              return el;
            }),
            total: teamUserMap[currentTeamId].total,
          },
        },
      };
    }
    case actionTypes.NEW_DIRECT_USER: {
      return {
        ...state,
        directChannelUsers: uniqBy(
          [...state.directChannelUsers, ...payload],
          'user_id',
        ),
      };
    }
    case actionTypes.NEW_USER: {
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [currentTeamId]: {
            data: [...(teamUserMap[currentTeamId]?.data || []), payload],
            total: teamUserMap[currentTeamId]?.total + 1,
          },
        },
      };
    }
    case actionTypes.NEW_CHANNEL: {
      const newDirectChannel = [...state.directChannel];
      if (payload.channel_type === 'Direct') {
        newDirectChannel.push(payload);
      }
      const newChannels = channelMap[currentTeamId] || [];
      if (
        payload.channel_type !== 'Direct' &&
        payload.team_id === currentTeamId
      ) {
        newChannels.push(payload);
      }
      return {
        ...state,
        channelMap:
          payload.channel_type === 'Direct'
            ? channelMap
            : {
                ...channelMap,
                [currentTeamId]: newChannels,
              },
        directChannel: uniqBy(newDirectChannel, 'channel_id'),
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId].map(el => {
            if (el.space_id === payload.space_id) {
              el.channel_ids = [...(el.channel_ids || []), payload.channel_id]
                .sort((a1, a2) => {
                  const name1 =
                    newChannels.find(el => el.channel_id === a1)
                      ?.channel_name || '';
                  const name2 =
                    newChannels.find(el => el.channel_id === a2)
                      ?.channel_name || '';
                  if (name1 > name2) return 1;
                  return -1;
                })
                .sort((a1, a2) => {
                  const type1 =
                    newChannels.find(el => el.channel_id === a1)
                      ?.channel_type || '';
                  const type2 =
                    newChannels.find(el => el.channel_id === a2)
                      ?.channel_type || '';
                  if (type1 > type2) return -1;
                  return 1;
                });
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.DELETE_GROUP_CHANNEL_SUCCESS: {
      const channel = channelMap[currentTeamId] || [];
      const currentIdx = channel.findIndex(
        el => el.channel_id === currentChannel.channel_id,
      );
      const nextChannels = channel.filter(
        el => el.space_id !== payload.spaceId,
      );
      const newCurrentChannel =
        nextChannels?.[currentIdx] || nextChannels?.[0] || defaultChannel;
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId].filter(
            el => el.space_id !== payload.spaceId,
          ),
        },
        channelMap: {
          ...channelMap,
          [currentTeamId]: nextChannels,
        },
        currentChannelId: newCurrentChannel.channel_id,
      };
    }
    case actionTypes.CREATE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: [...(spaceChannelMap[currentTeamId] || []), payload],
        },
      };
    }
    case actionTypes.UPDATE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map(el => {
            if (el.space_id === payload.space_id) {
              return {
                ...el,
                ...payload,
                attachment: null,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_SPACE_AVATAR_FAIL: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map(el => {
            if (el.space_id === payload.spaceId) {
              return {
                ...el,
                attachment: null,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_SPACE_AVATAR_REQUEST: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map(el => {
            if (el.space_id === payload.spaceId) {
              return {
                ...el,
                attachment: payload.attachment,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_CHANNEL_AVATAR_FAIL: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map(el => {
            if (el.channel_id === payload.channelId) {
              return {
                ...el,
                attachment: null,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_CHANNEL_AVATAR_REQUEST: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map(el => {
            if (el.channel_id === payload.channelId) {
              return {
                ...el,
                attachment: payload.attachment,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.USER_ONLINE: {
      const {user_id} = payload;
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [currentTeamId]: {
            ...teamUserMap[currentTeamId],
            data: teamUserMap[currentTeamId]?.data?.map(el => {
              if (el.user_id === user_id) {
                el.status = 'online';
                return {...el};
              }
              return el;
            }),
          },
        },
      };
    }
    case actionTypes.USER_OFFLINE: {
      const {user_id} = payload;
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [currentTeamId]: {
            ...teamUserMap[currentTeamId],
            data: teamUserMap[currentTeamId]?.data?.map(el => {
              if (el.user_id === user_id) {
                el.status = 'offline';
                return {...el};
              }
              return el;
            }),
          },
        },
      };
    }
    case actionTypes.GET_INITIAL: {
      return {
        ...state,
        imgDomain: payload.data.imgproxy?.domain,
        imgBucket: payload.data.imgproxy?.bucket_name,
        imgConfig: payload.data.img_config,
        loginGoogleUrl: payload.data.login_url,
      };
    }
    case actionTypes.LOGOUT: {
      return {
        ...initialState,
        imgDomain,
        imgConfig,
        imgBucket,
      };
    }
    case actionTypes.GET_TEAM_USER: {
      const {teamUsers, teamId} = payload;
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [teamId]: {
            data: teamUsers.data,
            total: teamUsers?.metadata?.total,
          },
        },
      };
    }
    case actionTypes.USER_SUCCESS: {
      return {
        ...state,
        userData: payload.user,
      };
    }
    case actionTypes.CURRENT_TEAM_REQUEST: {
      return {
        ...state,
        apiTeamController: payload.controller,
        currentTeamId: payload.team.team_id,
        currentChannelId: lastChannel?.[payload.team.team_id]?.channel_id,
      };
    }
    case actionTypes.CURRENT_TEAM_SUCCESS: {
      const {
        lastChannelId,
        resChannel,
        resDirectChannel,
        resSpace,
        directChannelUsersRes,
        lastDirectChannelId,
      } = payload;
      let channel: Channel = defaultChannel;
      let directChannel: Channel = defaultChannel;
      const directChannels = resDirectChannel?.data || state.directChannel;
      if (directChannels?.length > 0) {
        directChannel =
          directChannels?.find(el => el.channel_id === lastDirectChannelId) ||
          directChannels[0];
      }
      if (resChannel?.data?.length > 0) {
        channel =
          resChannel.data.find(c => c.channel_id === lastChannelId) ||
          resChannel.data.find(
            c =>
              c.channel_id === lastChannel?.[payload.team.team_id]?.channel_id,
          ) ||
          resChannel.data.filter(c => c.channel_type !== 'Direct')[0];
      }
      AsyncStorage.setItem(AsyncKey.lastChannelId, channel?.channel_id);
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [payload.team.team_id]: resChannel.data,
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [payload.team.team_id]: resSpace?.data?.map(el => {
            el.channel_ids = resChannel.data
              ?.filter(c => c.space_id === el.space_id)
              .map(c => c.channel_id);
            return el;
          }),
        },
        directChannel: resDirectChannel?.data || state.directChannel,
        currentTeamId: payload.team.team_id,
        currentChannelId: channel.channel_id,
        currentDirectChannelId: directChannel?.channel_id,
        lastChannel: {
          ...lastChannel,
          [payload.team.team_id]: channel,
        },
        memberData: {
          admin: {
            data: [],
            total: 0,
            canMore: false,
            currentPage: 1,
          },
          owner: {
            data: [],
            total: 0,
            canMore: false,
            currentPage: 1,
          },
          member: {
            data: [],
            total: 0,
            canMore: false,
            currentPage: 1,
          },
        },
        apiTeamController: null,
        directChannelUsers:
          directChannelUsersRes?.data || state.directChannelUsers,
      };
    }
    case actionTypes.CREATE_TEAM_SUCCESS: {
      return {
        ...state,
        team: [...(team || []), payload],
      };
    }
    case actionTypes.SET_CURRENT_CHANNEL: {
      if (payload.communityId) {
        lastChannel[payload.communityId] = payload.channel;
      } else {
        lastChannel[state?.currentTeamId] = payload.channel;
      }
      return {
        ...state,
        currentChannelId: payload.channel.channel_id,
        lastChannel,
      };
    }
    case actionTypes.SET_CURRENT_DIRECT_CHANNEL: {
      return {
        ...state,
        currentDirectChannelId: payload.directChannel.channel_id,
      };
    }
    case actionTypes.UPDATE_GROUP_CHANNEL: {
      const {channelId, spaceId} = payload;
      const space = spaceChannelMap[currentTeamId]?.find(
        g => g.space_id === spaceId,
      );
      if (!space) return state;
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map(el => {
            if (el.space_id === spaceId) {
              el.channel_ids = [...el.channel_ids, channelId];
            } else {
              el.channel_ids = el.channel_ids.filter(id => id !== channelId);
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.MARK_SEEN_CHANNEL: {
      const {channel_id} = payload;
      const channels = channelMap[currentTeamId]?.map(el => {
        if (el.channel_id === channel_id) {
          return {
            ...el,
            seen: true,
          };
        }
        return el;
      });
      state.channelMap = {
        ...channelMap,
        [currentTeamId]: channels,
      };
      state.directChannel = state.directChannel.map(el => {
        if (el.channel_id === channel_id) {
          return {
            ...el,
            seen: true,
          };
        }
        return el;
      });
      state.team = state.team?.map(el => {
        if (el.team_id === currentTeamId) {
          return {
            ...el,
            seen:
              channels.find(c => !c.seen && c.notification_type !== 'Muted') ===
              undefined,
          };
        }
        return el;
      });
      return state;
    }
    case actionTypes.MARK_UN_SEEN_CHANNEL: {
      const {channelId, communityId} = payload;
      const unSeenChannel =
        channelMap[currentTeamId]?.find(el => el.channel_id === channelId) ||
        directChannel.find(el => el.channel_id === channelId);
      if (!unSeenChannel?.seen) {
        return state;
      }
      const spaceId = unSeenChannel?.space_id;
      if (!spaceId) {
        return {
          ...state,
          directChannel: directChannel.map(el => {
            if (el.channel_id === channelId) {
              el.seen = false;
              return {...el};
            }
            return el;
          }),
        };
      }
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map(el => {
            if (el.channel_id === channelId) {
              return {
                ...el,
                seen: false,
              };
            }
            return el;
          }),
        },
        team: state.team?.map(el => {
          if (el.team_id === communityId) {
            return {
              ...el,
              seen: false,
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.TEAM_SUCCESS: {
      return {
        ...state,
        team: payload.team,
      };
    }
    case actionTypes.DELETE_CHANNEL_REQUEST: {
      const channel = channelMap[currentTeamId] || [];
      const teamUserData = teamUserMap[currentTeamId]?.data;
      const currentIdx = channel.findIndex(
        el => el.channel_id === currentChannel.channel_id,
      );
      const newChannel = channel.filter(
        el => el.channel_id !== payload.channelId,
      );
      let newCurrentChannel = defaultChannel;
      if (currentChannel.channel_id === payload.channelId) {
        newCurrentChannel =
          newChannel?.[currentIdx] || newChannel?.[0] || defaultChannel;
        if (newCurrentChannel.channel_type === 'Direct') {
          newCurrentChannel.user = teamUserData?.find(
            u => u.direct_channel === newCurrentChannel.channel_id,
          );
        }
      }
      return {
        ...state,
        lastChannel: {
          ...lastChannel,
          [payload.communityId]: newCurrentChannel,
        },
      };
    }
    case actionTypes.DELETE_CHANNEL_SUCCESS: {
      const channel = channelMap[currentTeamId] || [];
      const teamUserData = teamUserMap[currentTeamId]?.data;
      const currentIdx = channel.findIndex(
        el => el.channel_id === currentChannel.channel_id,
      );
      const spaceId = channel?.find(
        el => el.channel_id === payload.channelId,
      )?.space_id;
      const newChannel = channel.filter(
        el => el.channel_id !== payload.channelId,
      );
      const newDirectChannel = directChannel.filter(
        el => el.channel_id !== payload.channelId,
      );
      let newCurrentChannel = defaultChannel;
      if (currentChannel.channel_id === payload.channelId) {
        newCurrentChannel =
          newChannel?.[currentIdx] || newChannel?.[0] || defaultChannel;
        if (newCurrentChannel.channel_type === 'Direct') {
          newCurrentChannel.user = teamUserData?.find(
            u => u.direct_channel === newCurrentChannel.channel_id,
          );
        }
        AsyncStorage.setItem(
          AsyncKey.lastChannelId,
          newCurrentChannel?.channel_id,
        );
      } else {
        newCurrentChannel = currentChannel;
      }
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: newChannel,
        },
        directChannel: newDirectChannel,
        currentChannelId: newCurrentChannel.channel_id,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map(el => {
            if (el.space_id === spaceId) {
              el.channel_ids = el.channel_ids?.filter(
                id => id !== payload.channelId,
              );
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map(el => {
            if (el.channel_id === payload.channel_id) {
              return {...el, ...payload};
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.CREATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        lastChannel: {
          ...lastChannel,
          [currentTeamId]: payload,
        },
      };
    }
    case actionTypes.REMOVE_MEMBER_SUCCESS: {
      return {
        ...state,
        team:
          userData.user_id === payload.userId
            ? state.team?.filter(el => el.team_id !== payload.teamId)
            : state.team,
        teamUserMap: {
          ...teamUserMap,
          [payload.teamId]: {
            data: teamUserMap[payload.teamId]?.data?.filter(
              el => el.user_id !== payload.userId,
            ),
            total: teamUserMap[payload.teamId]?.total - 1,
          },
        },
      };
    }
    case actionTypes.LEAVE_TEAM_SUCCESS: {
      if (payload.teamId === currentTeamId) {
        return {
          ...state,
          directChannel: [],
          currentChannelId: '',
          spaceChannel: [],
          team: state?.team?.filter(el => el.team_id !== payload.teamId),
        };
      }
      return {
        ...state,
        team: state?.team?.filter(el => el.team_id !== payload.teamId),
      };
    }
    case actionTypes.USER_CHANNEL_SUCCESS: {
      return {
        ...state,
        userData: {
          ...userData,
          user_channels: payload.channels.map(el => el.channel_id),
        },
      };
    }
    case actionTypes.UPDATE_TEAM_SUCCESS: {
      const {teamId, body} = payload;
      return {
        ...state,
        team: state?.team?.map(el => {
          if (el.team_id === teamId) {
            return {
              ...el,
              ...body,
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.DELETE_TEAM_SUCCESS: {
      const {teamId} = payload;
      const newTeam = team?.filter(el => el.team_id !== teamId);
      return {
        ...state,
        currentTeamId:
          currentTeamId === teamId
            ? newTeam?.[0]?.team_id || currentTeamId
            : currentTeamId,
        team: newTeam,
      };
    }
    default:
      return state;
  }
};

export default userReducers;
