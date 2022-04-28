export type ThemeType = 'light' | 'dark';

export type Team = {
  team_display_name: string;
  team_icon: string;
  team_id: string;
  team_url: string;
};

export type SpaceChannel = {
  space_name: string;
  order: number;
  space_id?: string;
  space_type: 'Public' | 'Private';
};

export type Channel = {
  channel_id: string;
  channel_name: string;
  space?: SpaceChannel;
  space_id?: string;
  channel_type: 'Direct' | 'Public' | 'Private';
  seen: boolean;
  user?: User;
};

export type User = {
  avatar_url: string;
  email?: string;
  full_name: string;
  user_id: string;
  user_name: string;
  direct_channel?: string;
  status?: 'online' | 'offline';
};

export type Attachment = {
  file_id: string;
  file_url: string;
  mimetype: string;
  original_name: string;
};

export type Conversation = {
  channel_id: string;
  createdAt: string;
  message_attachment: Array<Attachment>;
  message_id: string;
  parent_id: string;
  sender_id: string;
  content: string;
  plain_text: string;
  updatedAt: string;
};

export type Message = {
  conversation_data: Array<Conversation>;
  createdAt: string;
  message_attachment: Array<Attachment>;
  message_id: string;
  parent_id: string;
  sender_id: string;
  content: string;
  plain_text: string;
  updatedAt: string;
  isHead?: boolean;
  isConversationHead?: boolean;
  task?: Task;
};

export type Reaction = {
  attachment_id: string;
  emoji_id: string;
  reaction_count: string;
  skin: number;
};

export type ReactData = {
  count: number;
  isReacted: boolean;
  reactName: string;
  skin: number;
};

export type UserReaction = {
  attachment_id: string;
  emoji_id: string;
};

export type Task = {
  channel: Array<Channel>;
  creator: string;
  due_date: string;
  notes: string;
  reaction_data: Array<Reaction>;
  status: 'todo' | 'doing' | 'done' | 'archived';
  task_attachment: Array<Attachment>;
  task_id: string;
  title: string;
  up_votes: number;
  user_reaction: Array<UserReaction>;
  comment_count?: number;
};

export type ArchivedTask = {
  channel: Channel;
  creator: string;
  due_date: string;
  notes: string;
  reaction_data: Array<Reaction>;
  status: 'archived';
  task_attachment: Array<Attachment>;
  task_id: string;
  title: string;
  up_votes: number;
  user_reaction: Array<UserReaction>;
};
