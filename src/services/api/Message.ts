import {ConversationData, MessageData} from 'models';
import ApiCaller from './ApiCaller';

export const getMessages = (
  channelId: string,
  limit = 20,
  before = new Date().toISOString(),
  after?: string,
  controller?: AbortController,
) => {
  let uri = `messages/${channelId}?page[size]=${limit}&page[before]=${before}&disable_encrypt=1`;
  if (after) {
    uri += `&page[after]=${after}`;
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
