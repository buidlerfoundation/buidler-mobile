import {Task} from 'models';
import moment from 'moment';
import {dateFormatted} from 'utils/DateUtils';

export const getToggleState = (group: any) => {
  const keys = Object.keys(group);
  const res: any = {};
  keys.forEach(k => {
    res[k] = true;
  });
  return res;
};

export const groupTaskByFiltered = (
  filterName: 'Status' | 'Due Date',
  tasks: Array<Task>,
) => {
  let res: {[key: string]: Array<Task>};
  if (filterName === 'Status') {
    res = tasks.reduce(
      (result, val) => {
        if (result[val.status] == null) {
          result[val.status] = [val];
        } else {
          result[val.status].push(val);
        }
        result[val.status].sort((item1: any, item2: any) =>
          item1.up_votes > item2.up_votes ? -1 : 1,
        );
        return result;
      },
      {todo: [], doing: [], done: []},
    );
  } else if (filterName === 'Due Date') {
    res = tasks
      .sort((v1: any, v2: any) => {
        if (new Date(v1.due_date).getTime() > new Date(v2.due_date).getTime()) {
          return -1;
        }
        if (new Date(v1.due_date).getTime() < new Date(v2.due_date).getTime()) {
          return 1;
        }
        return 0;
      })
      .reduce((result: any, val) => {
        const date = val.due_date
          ? dateFormatted(val.due_date, 'MM-DD-YYYY')
          : 'No date';
        if (result[date] == null) {
          result[date] = [val];
        } else {
          result[date].push(val);
        }
        result[date].sort((item1: any, item2: any) =>
          item1.up_votes > item2.up_votes ? -1 : 1,
        );
        return result;
      }, {});
  }
  return res;
};

// export const getIconByStatus = (status: string) => {
//   switch (status) {
//     case 'todo':
//       return images.icCheckOutline;
//     case 'doing':
//       return images.icCheckDoing;
//     case 'done':
//       return images.icCheckDone;
//     case 'archived':
//       return images.icCheckArchived;
//     default:
//       return images.icCheckOutline;
//   }
// };

export const isFilterStatus = (id: string) => {
  return id === 'todo' || id === 'doing' || id === 'done' || id === 'archived';
};

export const getGroupTask = (filterName: string, title: any) => {
  if (filterName === 'Status') {
    switch (title) {
      case 'todo':
        return 'Todo';
      case 'doing':
        return 'Doing';
      case 'done':
        return 'Done';
      default:
        return 'Todo';
    }
  } else if (filterName === 'Due Date') {
    if (title === 'No date') return title;
    const time = moment(new Date(title)).calendar(null, {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      lastWeek: '[Last] dddd',
      lastDay: '[Yesterday]',
      nextWeek: 'dddd',
      sameElse: 'YYYY-MM-DD',
    });
    return time;
  }
  return '';
};

export const sortPinPost = (v1: TaskData, v2: TaskData) => {
  // if (v1.up_votes > v2.up_votes) return -1;
  // if (v1.up_votes < v2.up_votes) return 1;
  if ((v1.createdAt || '') > (v2.createdAt || '')) return -1;
  if ((v1.createdAt || '') < (v2.createdAt || '')) return 1;
  return 0;
};
