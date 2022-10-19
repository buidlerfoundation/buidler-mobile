import React, {memo, useEffect, useState} from 'react';
import {Calendar} from 'react-native-calendars';
import Fonts from 'common/Fonts';
import moment from 'moment';
import useThemeColor from 'hook/useThemeColor';

type CalendarPickerProps = {
  onDateChange: (date: string) => void;
  currentDate?: Date;
};

const CalendarPicker = ({onDateChange, currentDate}: CalendarPickerProps) => {
  const {colors} = useThemeColor();
  const [markedDate, setMarkedDate] = useState<{
    [key: string]: {selected: boolean};
  }>({});
  useEffect(() => {
    if (currentDate) {
      setMarkedDate({
        [moment(currentDate).format('YYYY-MM-DD')]: {selected: true},
      });
    }
  }, [currentDate]);
  return (
    <Calendar
      style={{
        height: 350,
      }}
      markedDates={markedDate}
      onDayPress={date => {
        onDateChange(date.dateString);
        setMarkedDate({[date.dateString]: {selected: true}});
      }}
      theme={{
        calendarBackground: colors.background,
        textSectionTitleColor: colors.text,
        textSectionTitleDisabledColor: colors.subtext,
        selectedDayBackgroundColor: colors.primary,
        selectedDayTextColor: colors.text,
        todayTextColor: colors.primary,
        dayTextColor: colors.text,
        textDisabledColor: colors.subtext,
        dotColor: colors.primary,
        selectedDotColor: colors.primary,
        arrowColor: colors.primary,
        disabledArrowColor: colors.secondary,
        monthTextColor: colors.text,
        indicatorColor: colors.text,
        textDayFontFamily: Fonts.Medium,
        textMonthFontFamily: Fonts.Medium,
        textDayHeaderFontFamily: Fonts.Medium,
        textDayFontSize: 16,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 14,
      }}
    />
  );
};

export default memo(CalendarPicker);
