import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {Channel, GroupChannel, Team, ThemeType, User} from 'models';
import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {View, StyleSheet, TextInput, Text, Keyboard} from 'react-native';
import themes from 'themes';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import BottomSheetHandle from 'components/BottomSheetHandle';
import FastImage from 'react-native-fast-image';
import CalendarPicker from 'components/CalendarPicker';
import moment from 'moment';
import ImagePicker from 'utils/ImagePicker';
import {getUniqueId} from 'helpers/GenerateUUID';
import api from 'services/api';
import Spinner from 'components/Spinner';
import GalleryView from 'components/GalleryView';
import SocketUtils from 'utils/SocketUtils';
import {resizeImage} from 'helpers/ImageHelpers';
import AvatarView from 'components/AvatarView';
import PermissionHelper from 'helpers/PermissionHelper';
import HapticUtils from 'utils/HapticUtils';

type CreateTaskLayerProps = {
  themeType: ThemeType;
  isOpen: boolean;
  toggle: () => void;
  currentChannel: Channel;
  channels: Array<Channel>;
  teamUserData: Array<User>;
  currentTeam: Team;
  createTask: (channelId: string, body: any) => any;
  groupChannel: Array<GroupChannel>;
};

const CreateTaskLayer = ({
  themeType,
  isOpen,
  toggle,
  currentChannel,
  channels,
  teamUserData,
  currentTeam,
  createTask,
  groupChannel,
}: CreateTaskLayerProps) => {
  const sheetChannelRef = useRef<BottomSheet>(null);
  const sheetAssigneeRef = useRef<BottomSheet>(null);
  const sheetCalendarRef = useRef<BottomSheet>(null);
  const sheetGalleryRef = useRef<BottomSheet>(null);
  const titleRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const [isOpenImagePicker, setOpenImagePicker] = useState(false);
  const [sheetOpen, setSheetOpen] = useState<
    'channel' | 'assignee' | 'calendar' | 'gallery' | null
  >(null);
  const {colors} = themes[themeType];
  const [taskCreate, setTaskCreate] = useState({
    assignee: currentChannel?.user,
    dueDate: null,
    channels: currentChannel.channel_name ? [currentChannel] : [],
    title: '',
    notes: '',
    attachments: [],
  });
  useEffect(() => {
    if (isOpen) {
      setTaskCreate({
        assignee: currentChannel?.user,
        dueDate: null,
        channels: currentChannel.channel_name ? [currentChannel] : [],
        title: '',
        notes: '',
        attachments: [],
      });
    }
  }, [isOpen]);
  const snapPoints = useMemo(() => ['-50%', '50%', '80%'], []);

  // callbacks
  const handleSheetCalendarChange = useCallback(index => {
    if (index === 0) {
      setSheetOpen(null);
    } else if (index === 1 || index === 2) {
      setSheetOpen('calendar');
    }
  }, []);
  const handleSheetChange = useCallback(index => {
    if (index === 0) {
      setSheetOpen(null);
    } else if (index === 1) {
      setSheetOpen('channel');
    }
  }, []);
  const handleSheetGalleryChange = useCallback(index => {
    if (index === 0) {
      setSheetOpen(null);
    } else if (index === 1) {
      setSheetOpen('gallery');
    }
  }, []);
  const handleSheetAssigneeChange = useCallback(index => {
    if (index === 0) {
      setSheetOpen(null);
    } else if (index === 1) {
      setSheetOpen('assignee');
    }
  }, []);
  const renderAssigneeItem = useCallback(
    ({item}) => {
      const isSelected = taskCreate.assignee?.user_id == item.user_id;
      return (
        <Touchable
          style={styles.selectorAssigneeItem}
          onPress={() => {
            setTaskCreate(current => ({
              ...current,
              assignee: isSelected ? null : item,
            }));
            onCloseAssign();
          }}>
          <View style={{marginRight: 15}}>
            <AvatarView
              user={teamUserData.find(u => u.user_id === item.user_id)}
              themeType={themeType}
            />
          </View>
          <Text style={[styles.selectorChannelText, {color: colors.text}]}>
            {item.full_name}
          </Text>
          <View style={{flex: 1}} />
          {isSelected && <SVG.IconCheck fill={colors.text} />}
        </Touchable>
      );
    },
    [taskCreate.assignee?.user_id],
  );
  const renderItem = useCallback(
    ({item}) => {
      return (
        <View>
          <View style={styles.groupHead}>
            <SVG.IconCollapse fill={colors.subtext} />
            <Text style={[styles.groupName, {color: colors.subtext}]}>
              {item.group_channel_name}
            </Text>
          </View>
          {channels
            .filter(c => c.group_channel_id === item.group_channel_id)
            .map(ch => {
              const isSelected = !!taskCreate.channels.find(
                c => c.channel_id === ch.channel_id,
              );
              return (
                <Touchable
                  key={ch.channel_id}
                  style={styles.selectorChannelItem}
                  onPress={() => {
                    setTaskCreate(current => ({
                      ...current,
                      channels: isSelected
                        ? current.channels.filter(
                            c => c.channel_id !== ch.channel_id,
                          )
                        : [...current.channels, ch],
                    }));
                  }}>
                  <Text
                    style={[styles.selectorChannelText, {color: colors.text}]}>
                    # {ch.channel_name}
                  </Text>
                  {isSelected && <SVG.IconCheck fill={colors.text} />}
                </Touchable>
              );
            })}
        </View>
      );
    },
    [taskCreate.channels.map(c => c.channel_id).join(',')],
  );
  const handleSnapPress = useCallback(index => {
    sheetChannelRef.current?.snapTo(index);
  }, []);
  if (!isOpen) return null;
  const onOutSidePress = () => {
    if (sheetOpen === 'channel') {
      sheetChannelRef.current.snapTo(0);
    } else if (sheetOpen === 'assignee') {
      sheetAssigneeRef.current.snapTo(0);
    } else if (sheetOpen === 'calendar') {
      sheetCalendarRef.current.snapTo(0);
    } else if (sheetOpen === 'gallery') {
      sheetGalleryRef.current.snapTo(0);
    } else {
      toggle();
    }
  };
  const clearFocus = () => {
    if (titleRef.current.isFocused()) {
      titleRef.current.blur();
    } else if (descriptionRef.current.isFocused()) {
      descriptionRef.current.blur();
    }
  };
  const openImagePicker = async () => {
    const permission = await PermissionHelper.checkPermissionCamera();
    if (permission) {
      setOpenImagePicker(true);
      sheetGalleryRef.current?.snapTo(2);
    }
  };
  const onCreatePress = async () => {
    const loadingAttachment = taskCreate.attachments.find(
      (att: any) => att.loading,
    );
    if (!!loadingAttachment) {
      alert('Attachment is uploading');
      return;
    }
    if (taskCreate.channels.length === 0) {
      alert('Channels can not be empty');
      return;
    }
    const body: any = {
      title: taskCreate?.title,
      notes: taskCreate?.notes,
      status: 'todo',
      due_date: taskCreate?.dueDate
        ? moment(taskCreate?.dueDate).format('YYYY-MM-DD HH:mm:ss.SSSZ')
        : null,
      channel_ids: taskCreate.channels.map(c => c.channel_id),
      assignee_id: taskCreate.assignee?.user_id,
      attachments: taskCreate.attachments.map((att: any) => att.url),
    };
    if (SocketUtils.generateId !== '') {
      body.task_id = SocketUtils.generateId;
    }
    await createTask(currentChannel?.channel_id, body);
    HapticUtils.trigger();
    SocketUtils.generateId = null;
    toggle();
  };
  const onCloseAssign = () => {
    sheetAssigneeRef.current.snapTo(0);
  };
  const onCloseDate = () => {
    sheetCalendarRef.current.snapTo(0);
  };
  const onCloseChannel = () => {
    sheetChannelRef.current.snapTo(0);
  };
  const onCloseGallery = () => {
    sheetGalleryRef.current.snapTo(0);
    setOpenImagePicker(false);
  };
  const onSelectPhoto = async (items: Array<any>) => {
    if (!SocketUtils.generateId) {
      SocketUtils.generateId = getUniqueId();
    }
    onCloseGallery();
    const imagesResized = await Promise.all(
      items.map(image => {
        return resizeImage(image);
      }),
    );
    imagesResized.forEach(img => {
      const randomId = Math.random();
      setTaskCreate(task => ({
        ...task,
        attachments: [
          ...task.attachments,
          {
            uri: img.uri,
            randomId,
            loading: true,
          },
        ],
      }));
      api
        .uploadFile(currentTeam.team_id, SocketUtils.generateId, {
          uri: img.uri,
          name: img.name,
          type: 'multipart/form-data',
        })
        .then(res => {
          if (res.statusCode === 200) {
            setTaskCreate(task => ({
              ...task,
              attachments: task.attachments.map(el => {
                if (el.randomId === randomId) {
                  el.url = res.file_url;
                  el.loading = false;
                }
                return el;
              }),
            }));
          } else {
            setTaskCreate(task => ({
              ...task,
              attachments: task.attachments.filter(
                el => el.randomId !== randomId,
              ),
            }));
          }
        });
    });
  };
  return (
    <View
      style={[
        {
          flex: 1,
        },
      ]}>
      <Touchable onPress={onOutSidePress} style={{flex: 1}}>
        <View />
      </Touchable>
      <View
        style={[
          styles.createTaskBody,
          {
            backgroundColor: colors.activeBackgroundLight,
            borderColor: colors.border,
          },
        ]}>
        <TextInput
          ref={titleRef}
          placeholder="Add new task"
          style={[styles.inputTitle, {color: colors.text}]}
          placeholderTextColor={colors.subtext}
          autoFocus
          keyboardAppearance="dark"
          value={taskCreate.title}
          blurOnSubmit={false}
          multiline
          onChangeText={text => setTaskCreate({...taskCreate, title: text})}
        />
        <TextInput
          ref={descriptionRef}
          placeholder="Add notes"
          style={[styles.inputDescription, {color: colors.text}]}
          placeholderTextColor={colors.subtext}
          keyboardAppearance="dark"
          multiline
          value={taskCreate.notes}
          onChangeText={text => setTaskCreate({...taskCreate, notes: text})}
        />
        {taskCreate.attachments.length > 0 && (
          <View style={styles.attachmentView}>
            {taskCreate.attachments.map(attachment => (
              <View
                style={styles.attachmentItem}
                key={attachment.id || attachment.randomId}>
                <FastImage
                  source={{uri: attachment.uri}}
                  style={{borderRadius: 5, width: 150, height: 90}}
                  resizeMode="cover"
                />
                {attachment.loading && (
                  <Spinner size="small" backgroundColor="#11111180" />
                )}
                <Touchable
                  style={{
                    padding: 10,
                    position: 'absolute',
                    top: -15,
                    right: -15,
                  }}
                  onPress={() =>
                    setTaskCreate(task => ({...task, attachments: []}))
                  }>
                  <View
                    style={[
                      styles.clearButton,
                      {backgroundColor: colors.subtext},
                    ]}>
                    <SVG.IconClose fill={colors.text} />
                  </View>
                </Touchable>
              </View>
            ))}
          </View>
        )}
        <View style={styles.channelView}>
          {taskCreate.channels.map(c => {
            return (
              <View
                key={c.channel_id}
                style={[styles.channelItem, {borderColor: colors.border}]}>
                <Text style={[styles.channelName, {color: colors.text}]}>
                  # {c.channel_name}
                </Text>
              </View>
            );
          })}
          <Touchable
            style={[styles.addChannelButton, {borderColor: colors.border}]}
            onPress={() => {
              handleSnapPress(1);
            }}>
            <SVG.IconPlus fill={colors.text} width={12} height={12} />
          </Touchable>
        </View>
        <View style={styles.actionView}>
          <Touchable style={styles.actionButton} onPress={openImagePicker}>
            <SVG.IconPhoto fill={colors.text} width={20} height={20} />
          </Touchable>
          <Touchable
            style={styles.actionButton}
            onPress={() => sheetAssigneeRef.current?.snapTo(1)}>
            {taskCreate?.assignee ? (
              <AvatarView
                themeType={themeType}
                user={teamUserData.find(
                  u => u.user_id === taskCreate.assignee.user_id,
                )}
                size={20}
              />
            ) : (
              <SVG.IconAssign fill={colors.text} width={20} height={20} />
            )}
          </Touchable>
          <Touchable
            style={styles.actionButton}
            onPress={() => {
              sheetCalendarRef.current?.snapTo(2);
            }}>
            {taskCreate.dueDate ? (
              <View style={[styles.dateView, {borderColor: colors.border}]}>
                <Text style={[styles.dateText, {color: colors.text}]}>
                  {moment(taskCreate.dueDate).format('MMM DD')}
                </Text>
              </View>
            ) : (
              <SVG.IconCalendar fill={colors.text} width={20} height={20} />
            )}
          </Touchable>
          <View style={{flex: 1}} />
          <Touchable
            style={styles.createButton}
            onPress={onCreatePress}
            disabled={!taskCreate.title}>
            <SVG.IconArrowSend />
          </Touchable>
        </View>
      </View>
      <BottomSheet
        ref={sheetChannelRef}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        handleComponent={() => (
          <BottomSheetHandle
            title="Channels"
            themeType={themeType}
            onClosePress={onCloseChannel}
          />
        )}>
        <BottomSheetFlatList
          keyboardShouldPersistTaps="handled"
          data={groupChannel}
          keyExtractor={g => g.group_channel_id || g.group_channel_name}
          renderItem={renderItem}
          style={{backgroundColor: colors.background}}
          ListFooterComponent={
            <View style={{height: 20 + AppDimension.extraBottom}} />
          }
        />
      </BottomSheet>
      <BottomSheet
        ref={sheetAssigneeRef}
        snapPoints={snapPoints}
        onChange={handleSheetAssigneeChange}
        handleComponent={() => (
          <BottomSheetHandle
            title="Assigned to"
            themeType={themeType}
            onClosePress={onCloseAssign}
          />
        )}>
        <BottomSheetFlatList
          keyboardShouldPersistTaps="handled"
          data={teamUserData}
          keyExtractor={u => u.user_id}
          renderItem={renderAssigneeItem}
          style={{backgroundColor: colors.background}}
          ListFooterComponent={
            <View style={{height: 20 + AppDimension.extraBottom}} />
          }
        />
      </BottomSheet>
      <BottomSheet
        ref={sheetCalendarRef}
        snapPoints={snapPoints}
        onChange={handleSheetCalendarChange}
        handleComponent={() => (
          <BottomSheetHandle
            title="Due date"
            themeType={themeType}
            onClosePress={onCloseDate}
          />
        )}>
        <View style={{flex: 1, backgroundColor: colors.background}}>
          <CalendarPicker
            themeType={themeType}
            onDateChange={date => {
              setTaskCreate(task => ({...task, dueDate: new Date(date)}));
            }}
            currentDate={taskCreate.dueDate}
          />
        </View>
      </BottomSheet>
      <BottomSheet
        ref={sheetGalleryRef}
        snapPoints={snapPoints}
        onChange={handleSheetGalleryChange}
        handleComponent={() => (
          <BottomSheetHandle
            title="Photos"
            themeType={themeType}
            onClosePress={onCloseGallery}
          />
        )}>
        <GalleryView
          themeType={themeType}
          onSelectPhoto={onSelectPhoto}
          isOpen={isOpenImagePicker}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createTaskBody: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  inputTitle: {
    fontFamily: Fonts.Medium,
    fontSize: 16,
    maxHeight: 150,
    padding: 10,
  },
  inputDescription: {
    fontFamily: Fonts.Medium,
    fontSize: 14,
    lineHeight: 19,
    maxHeight: 150,
    padding: 10,
  },
  channelView: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  channelItem: {
    marginTop: 10,
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
  },
  channelName: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: Fonts.Medium,
  },
  addChannelButton: {
    width: 25,
    height: 25,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    padding: 10,
  },
  createButton: {
    padding: 5,
  },
  selectorChannelItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorAssigneeItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorChannelText: {
    fontFamily: Fonts.Medium,
    fontSize: 16,
    lineHeight: 19,
  },
  avatar: {width: 25, height: 25, borderRadius: 12.5, marginRight: 15},
  dateView: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
  },
  dateText: {
    fontFamily: Fonts.Medium,
    fontSize: 12,
    lineHeight: 14,
  },
  attachmentView: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  attachmentItem: {
    marginTop: 10,
    marginRight: 10,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 20,
  },
  groupName: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 19,
    marginLeft: 12,
  },
});

export default CreateTaskLayer;
