import moment from 'moment';

export const normalizeMessage = (messages: Array<any>) => {
  return messages.map((msg, index) => {
    if (msg.sender_id !== messages?.[index + 1]?.sender_id) {
      msg.isHead = true;
    }
    if (msg.parent_id !== messages?.[index + 1]?.parent_id) {
      msg.isConversationHead = true;
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

export const normalizeMessageText = (text: string, isShowNote = false) => {
  if (!text) return '';
  let res = text?.replace?.(/<br>/g, '\n');
  const regexLink = /(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |$)/gim;
  const linkMatches = res?.match(regexLink);
  linkMatches?.forEach(el => {
    const linkMatch = /(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |$)/.exec(el);
    if (linkMatch && linkMatch?.length >= 5) {
      res = res?.replace(
        el,
        `<a onclick='event.stopPropagation();' target='_blank' href='${linkMatch[1]}://${linkMatch[2]}.${linkMatch[3]}${linkMatch[4]}'>${linkMatch[1]}://${linkMatch[2]}.${linkMatch[3]}${linkMatch[4]}</a>${linkMatch[5]}`,
      );
    }
  });
  res = res?.replace?.(/\$mention_location/g, `#/home`);
  // if (isShowNote) {
  //   return `<div style='display: flex; align-items: flex-start'><span>${res}</span><img src='${images.icNote}' style='margin-left: 15px; margin-top: 7px' /></div>`;
  // }
  return `<span>${res}</span>`;
};
