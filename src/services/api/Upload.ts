import AppConfig from 'common/AppConfig';
import {AttachmentData, BaseDataApi, FileApiData} from 'models';
import ApiCaller from './ApiCaller';

export const uploadFile = (
  teamId?: string,
  attachmentId?: string,
  file?: any,
): Promise<BaseDataApi<FileApiData>> => {
  if (file?.size > AppConfig.maximumFileSize) {
    return Promise.resolve({
      success: false,
      statusCode: 400,
      message: 'Your file upload is too large. Maximum file size 100 MB.',
    });
  }
  const data = new FormData();
  if (teamId) {
    data.append('team_id', teamId);
  }
  if (attachmentId) {
    data.append('attachment_id', attachmentId);
  }
  data.append('file', file);
  return ApiCaller.post<FileApiData>('file', data);
};

export const removeFile = (fileId: string) =>
  ApiCaller.delete(`file/${fileId}`);

export const getSpaceFile = (spaceId: string) =>
  ApiCaller.get<Array<AttachmentData>>(`file/space/${spaceId}`);

export const getChannelFile = (channelId: string) =>
  ApiCaller.get<Array<AttachmentData>>(`file/channel/${channelId}`);
