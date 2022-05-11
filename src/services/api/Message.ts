import ApiCaller from './ApiCaller';

export const getMessages = (
  channelId: string,
  limit = 20,
  before = new Date().toISOString(),
  after?: string,
) => {
  let uri = `messages/${channelId}?page[size]=${limit}&page[before]=${before}&disable_encrypt=1`;
  if (after) {
    uri += `&page[after]=${after}`;
  }
  return ApiCaller.get(uri);
};

export const getConversation = (
  parentId: string,
  limit = 20,
  before = new Date().toISOString(),
) => {
  return ApiCaller.get(
    `messages/conversation/${parentId}?page[size]=${limit}&page[before]=${before}&disable_encrypt=1`,
  );
};

export const editMessage = (
  id: string,
  content: string,
  plain_text: string,
) => {
  return ApiCaller.put(`message/${id}`, {content, plain_text});
};
