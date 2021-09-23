import { CalendarItem } from '@skolplattformen/embedded-api'
import { Button, MenuItem, OverflowMenu, Text } from '@ui-kitten/components'
import moment from 'moment'
import React from 'react'
import { Linking, Platform } from 'react-native'
import RNCalendarEvents from 'react-native-calendar-events'
import Toast from 'react-native-simple-toast'
import { translate } from '../utils/translation'
import {
  CalendarOutlineIcon,
  MoreIcon,
  PlusSquareOutline,
} from './icon.component'

interface SaveToCalendarProps {
  event: CalendarItem
}

export const SaveToCalendar = ({ event }: SaveToCalendarProps) => {
  const [visible, setVisible] = React.useState(false)

  const renderToggleButton = () => (
    <Button
      testID="actionsButton"
      accessibilityHint={translate('calender.showCalenderActions')}
      onPress={() => setVisible(true)}
      appearance="ghost"
      accessoryLeft={MoreIcon}
    />
  )

  const closeOverflowMenu = () => {
    setVisible(false)
  }

  const toast = (text: string) =>
    Toast.showWithGravity(text, Toast.SHORT, Toast.BOTTOM)

  function removeEmptyValues<T extends object>(obj: T) {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v != null)
    ) as { [K in keyof T]: any }
  }

  const requestPermissionsAndSave = async ({
    title,
    startDate,
    endDate,
    location,
  }: CalendarItem) => {
    const auth = await RNCalendarEvents.requestPermissions()

    if (auth === 'authorized') {
      try {
        const details = {
          startDate: startDate
            ? new Date(startDate).toISOString()
            : new Date().toISOString(),
          endDate: endDate
            ? new Date(endDate).toISOString()
            : new Date().toISOString(),
          location,
        }

        const detailsWithoutEmpty = removeEmptyValues(details)

        await RNCalendarEvents.saveEvent(title, detailsWithoutEmpty)

        toast(translate('calender.saveToCalenderSuccess'))
      } catch (err) {
        toast(translate('calender.saveToCalenderError'))
      }
      closeOverflowMenu()
    } else {
      toast(translate('calender.approveAccessToCalender'))
    }
  }

  const openCalendarToDate = (dateToLinkTo: moment.MomentInput) => {
    const calenderDate = moment(dateToLinkTo) // date is local time

    if (Platform.OS === 'ios') {
      const referenceDate = moment.utc('2001-01-01') // reference date is utc
      const seconds = calenderDate.unix() - referenceDate.unix()
      Linking.openURL('calshow:' + seconds)
    } else if (Platform.OS === 'android') {
      const msSinceEpoch = calenderDate.valueOf() // milliseconds since epoch
      Linking.openURL('content://com.android.calendar/time/' + msSinceEpoch)
    }
  }

  return (
    <OverflowMenu
      visible={visible}
      anchor={renderToggleButton}
      onBackdropPress={closeOverflowMenu}
    >
      <MenuItem
        accessoryLeft={PlusSquareOutline}
        title={(evaProps) => (
          <Text {...evaProps} maxFontSizeMultiplier={2}>
            {translate('calender.saveToCalender')}
          </Text>
        )}
        onPress={() => requestPermissionsAndSave(event)}
      />
      <MenuItem
        accessoryLeft={CalendarOutlineIcon}
        title={(evaProps) => (
          <Text {...evaProps} maxFontSizeMultiplier={2}>
            {'Visa i telefonens kalender'}
          </Text>
        )}
        onPress={() => openCalendarToDate(event.startDate)}
      />
    </OverflowMenu>
  )
}
