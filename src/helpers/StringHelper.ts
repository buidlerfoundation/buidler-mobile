import numeral from 'numeral';

export const formatAmount = (amount: string) => {
  const splitted = amount.split('.');
  if (splitted.length === 2) {
    return `${splitted[0]}.${splitted[1].substring(0, 5)}`;
  }
  return amount;
};

export const isNotFormat = (number: string | number) => {
  const str = `${number}`;
  const splitted = str.split('.');
  const strAfterDot = splitted?.[1]?.substring(0, 5);
  return (
    splitted.length === 2 &&
    (parseInt(strAfterDot) === 0 || isNaN(parseInt(strAfterDot)))
  );
};

export const formatNumber = (number: string | number, removeZero = true) => {
  if (!number) return '';
  const str = `${number}`.includes('e')
    ? number.toLocaleString('fullwide', {useGrouping: false})
    : `${number}`;
  if (str.includes('.')) {
    const splitted = str.split('.');
    let res = `${numeral(splitted[0]).format('0,0')}.${splitted[1].substring(
      0,
      5,
    )}`;
    if (removeZero) {
      res = res.replace(/0*$/g, '');
      if (res[res.length - 1] === '.') {
        res = res.substring(0, res.length - 1);
      }
    }
    return res;
  }
  return numeral(str).format('0,0');
};

export const seconds2time = seconds => {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds - hours * 3600) / 60);
  var seconds = seconds - hours * 3600 - minutes * 60;
  var time = '';

  if (hours !== 0) {
    time = hours + ':';
  }
  if (minutes !== 0 || time !== '') {
    minutes = minutes < 10 && time !== '' ? '0' + minutes : String(minutes);
    time += minutes + ':';
  }
  if (time === '') {
    time = '00:' + seconds;
  } else {
    time += seconds < 10 ? '0' + seconds : String(seconds);
  }
  return time;
};
