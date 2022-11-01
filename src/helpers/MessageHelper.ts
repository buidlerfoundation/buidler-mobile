import moment from 'moment';

export const normalizeMessage = (messages: Array<any>) => {
  return messages.map((msg, index) => {
    const date = moment(new Date(msg.createdAt)).format('YYYY-MM-DD');
    const dateCompare = messages?.[index + 1]
      ? moment(new Date(messages?.[index + 1].createdAt)).format('YYYY-MM-DD')
      : null;
    if (
      msg.sender_id !== messages?.[index + 1]?.sender_id ||
      !!messages?.[index + 1]?.task
    ) {
      msg.isHead = true;
    }
    if (
      msg.sender_id === messages?.[index + 1]?.sender_id &&
      date !== dateCompare
    ) {
      msg.isHead = true;
    }
    return msg;
  });
};

export const normalizeMessages = (messages?: Array<any>) => {
  if (!messages) return [];
  return messages.reduce((result: Array<any>, val) => {
    const date = moment(new Date(val.createdAt)).format('YYYY-MM-DD');
    const index = result.findIndex(el => el.title === date);
    if (index >= 0) {
      const msg =
        result[index]?.data?.length > 0 ? [...result[index].data, val] : [val];
      result[index].data = msg;
    } else {
      result.push({title: date, data: [val]});
    }
    return result;
  }, []);
};

export const normalizeMessageTextPlain = (
  text: string,
  messageReply?: boolean,
  isEdited?: boolean,
  withoutHtml?: boolean,
  isArchived?: boolean,
) => {
  if (!text) return '';
  let res = text
    .replace(/^#### (.*$)/gim, '$1')
    .replace(/^### (.*$)/gim, '$1')
    .replace(/^## (.*$)/gim, '$1')
    .replace(/^# (.*$)/gim, '$1')
    .replace(/^> (.*$)/gim, '$1')
    .replace(/\*\*(.*)\*\*/gim, '$1')
    .replace(/\*(.*)\*/gim, '$1')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n$/gim, '<br />');

  if (messageReply || withoutHtml) {
    res = res.replace(/(<@)(.*?)(-)(.*?)(>)/gim, '@$2');
  } else {
    res = res
      .replace(
        /((https?|ftps?):\/\/[^"<\s]+)(?![^<>]*>|[^"]*?<\/a)/gim,
        "<a class='text-ellipsis' style='white-space: pre-line;' href='$1'>$1</a>",
      )
      .replace(
        /\$mention_location/g,
        'https://community.buidler.app/channels/user',
      )
      .replace(
        /(<@)(.*?)(-)(.*?)(>)/gim,
        '<a href="https://community.buidler.app/channels/user/$4" class="mention-string">@$2</a>',
      );
  }
  if (withoutHtml) return res;
  return `<div class='${
    isArchived
      ? 'message-text-archived'
      : messageReply
      ? 'message-text-reply'
      : 'message-text'
  }'>${res}${
    isEdited ? ' <span class="edited-string">edited</span>' : ''
  }</div>`;
};

export const normalizeMessageText = (
  text: string,
  wrapParagraph?: boolean,
  messageEdit?: boolean,
  isEdited?: boolean,
  customClass?: string,
) => {
  if (!text) return '';
  if (messageEdit) {
    return text
      .replace(
        /(<@)(.*?)(-)(.*?)(>)/gim,
        '<a href="https://community.buidler.app/channels/user/$4" class="mention-string">@$2</a>',
      )
      .replace(/href=".*?\/channels\/user/g, 'href="$mention_location');
  }
  let res = text
    .replace(/<br>/gim, '\n')
    .replace(/\n- (.*)/gim, '\n  • $1')
    .replace(/^#### (.*$)(\n)/gim, '<h4>$1</h4>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)(\n)/gim, '<h3>$1</h3>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)(\n)/gim, '<h2>$1</h2>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)(\n)/gim, '<h1>$1</h1>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*)\*/gim, '<i>$1</i>')
    .replace(
      /!\[(.*?)\]\((.*?)\)/gim,
      "<p><img class='image-inline' alt='$1' src='$2' /></p>",
    )
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n$/gim, '<br />')
    .replace(
      /((https?|ftps?):\/\/[^"<\s]+)(?![^<>]*>|[^"]*?<\/a)/gim,
      "<a href='$1'>$1</a>",
    )
    .replace(
      /\$mention_location/g,
      'https://community.buidler.app/channels/user',
    )
    .replace(
      /(<@)(.*?)(-)(.*?)(>)/gim,
      '<a href="https://community.buidler.app/channels/user/$4" class="mention-string">@$2</a>',
    );

  if (wrapParagraph) {
    res = res.replace(/^([^<]*)([^<]*)$/gim, '<p>$1</p>');
  }
  return `<div class=${customClass ? customClass : 'message-text'}>${res}${
    isEdited ? ' <span class="edited-string">edited</span>' : ''
  }</div>`;
};

export const normalizeUserName = (str: string, length = 5) => {
  if (str?.length > 20) {
    return `${str.substring(0, length)}...${str.substring(
      str.length - length,
      str.length,
    )}`;
  }
  return str;
};
