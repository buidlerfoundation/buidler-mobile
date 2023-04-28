import {getDeviceCode} from 'helpers/GenerateUUID';
import {ConversationData, MessageData} from 'models';
import ApiCaller from './ApiCaller';

export const getPinPostMessage = async (
  postId: string,
  limit = 15,
  before?: string,
  after?: string,
  controller?: AbortController,
) => {
  const deviceCode = await getDeviceCode();
  let uri = `messages/${postId}/post?page[size]=${limit}&device_code=${deviceCode}`;
  if (after) {
    if (before) {
      uri += `&page[before]=${before}`;
    }
    uri += `&page[after]=${after}`;
  } else {
    uri += `&page[before]=${before || new Date().toISOString()}`;
  }
  return ApiCaller.get<Array<MessageData>>(uri, undefined, controller);
};

export const deleteMessage = (messageId: string) =>
  ApiCaller.delete(`message/${messageId}`);

export const getMessages = async (
  channelId: string,
  limit = 20,
  before?: string,
  after?: string,
  controller?: AbortController,
) => {
  const deviceCode = await getDeviceCode();
  let uri = `messages/${channelId}?page[size]=${limit}&device_code=${deviceCode}`;
  if (after) {
    if (before) {
      uri += `&page[before]=${before}`;
    }
    uri += `&page[after]=${after}`;
  } else {
    uri += `&page[before]=${before || new Date().toISOString()}`;
  }
  return ApiCaller.get<Array<MessageData>>(uri, undefined, controller);
};

export const getConversation = (
  parentId: string,
  limit = 20,
  before = new Date().toISOString(),
) => {
  return ApiCaller.get<Array<ConversationData>>(
    `messages/conversation/${parentId}?page[size]=${limit}&page[before]=${before}`,
  );
};

export const editMessage = (
  id: string,
  content: string,
  plain_text: string,
) => {
  return ApiCaller.put(`message/${id}`, {content, plain_text});
};

export const getAroundMessageById = async (messageId: string, limit = 10) => {
  const deviceCode = await getDeviceCode();
  return ApiCaller.get<Array<MessageData>>(
    `messages/${messageId}/jump?device_code=${deviceCode}&limit=${limit}`,
  );
};

export const upVoteScamMessage = id =>
  ApiCaller.post(`scam-alert/${id}/upvote`);

export const downVoteScamMessage = id =>
  ApiCaller.post(`scam-alert/${id}/downvote`);
