export const buildLinkOpenSea = (slugName: string) =>
  `https://opensea.io/collection/${slugName}`;

export const buildLinkUniSwap = (params: {
  amount: number;
  contract_address: string;
}) =>
  `https://app.uniswap.org/#/swap?exactField=output&exactAmount=${params.amount}&outputCurrency=${params.contract_address}&chain=mainnet`;

export const buidlerURL = 'https://community.buidler.app';

const getUrlWithoutPostOrMessage = (buidlerUrl: string) => {
  const idx = Math.max(
    buidlerUrl.indexOf('/post'),
    buidlerUrl.indexOf('/message'),
  );
  if (idx > 0) return buidlerUrl.substring(0, idx);
  return buidlerUrl;
};

export const extractBuidlerUrl = (buidlerUrl: string) => {
  const normalizeUrl = getUrlWithoutPostOrMessage(buidlerUrl);
  const postId = buidlerUrl.split('post/')?.[1];
  const messageId = buidlerUrl.split('message/')?.[1];

  const index = normalizeUrl.lastIndexOf('channels/') + 8;
  const lastIndex = normalizeUrl.lastIndexOf('/');
  let communityId, channelId;
  channelId = normalizeUrl.substring(lastIndex + 1);
  if (index === lastIndex) {
    communityId = normalizeUrl.substring(index + 1);
  } else {
    communityId = normalizeUrl.substring(index + 1, lastIndex);
  }

  return {
    channelId,
    communityId,
    postId,
    messageId,
  };
};
