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

export const normalizeMessages = (messages: Array<any>) => {
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

export const normalizeMessageText = (text: string, wrapParagraph?: boolean) => {
  if (!text) return '';
  let res = text
    .replace(/<br>/gim, '\n')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
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
      "<a onclick='event.stopPropagation();' target='_blank' href='$1'>$1</a>",
    )
    .replace(/\$mention_location/g, `${window.location.origin}/channels/user`)
    .replace(
      /(<@)(.*?)(-)(.*?)(>)/gim,
      `<a href="${window.location.origin}/channels/user/$4" class="mention-string">@$2</a>`,
    );

  if (wrapParagraph) {
    res = res.replace(/^([^<]*)([^<]*)$/gim, '<p>$1</p>');
  }
  return `<div class='enable-user-select'>${res}</div>`;
};

export const normalizeUserName = (str: string) => {
  if (str?.length > 20) {
    return `${str.substring(0, 5)}...${str.substring(
      str.length - 5,
      str.length,
    )}`;
  }
  return str;
};
