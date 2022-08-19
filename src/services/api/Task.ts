import {TaskData} from 'models';
import ApiCaller from './ApiCaller';

export const createTask = (body: any) => ApiCaller.post<TaskData>('task', body);

export const updateTask = (body: any, id: string) =>
  ApiCaller.put<TaskData>(`task/${id}`, body);

export const deleteTask = (id: string) => ApiCaller.delete(`task/${id}`);

export const getTasks = (channelId: string, controller?: AbortController) =>
  ApiCaller.get<Array<TaskData>>(`tasks/${channelId}`, undefined, controller);

export const getArchivedTasks = (channelId: string) =>
  ApiCaller.get<Array<TaskData>>(`tasks/${channelId}?archived=true`);

export const getArchivedTaskFromUser = (userId: string, teamId: string) =>
  ApiCaller.get<Array<TaskData>>(
    `tasks/${userId}/user/${teamId}?archived=true`,
  );

export const getTaskFromUser = (userId: string, teamId: string) =>
  ApiCaller.get<Array<TaskData>>(
    `tasks/${userId}/user/${teamId}?archived=false`,
  );

export const getArchivedTaskCount = (
  channelId: string,
  controller?: AbortController,
) =>
  ApiCaller.get<{total: number}>(
    `task/${channelId}/count?archived=true`,
    undefined,
    controller,
  );

export const getArchivedTaskCountFromUser = (userId: string, teamId: string) =>
  ApiCaller.get<{total: number}>(
    `task/${userId}/user/${teamId}/count?archived=true`,
  );
