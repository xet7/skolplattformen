import { useTimetable } from '@skolplattformen/api-hooks'
import { Child } from '@skolplattformen/embedded-api'
import { StyleService, Text, useStyleSheet } from '@ui-kitten/components'
import moment, { Moment } from 'moment'
import React from 'react'
import { View } from 'react-native'
import { LanguageService } from '../services/languageService'
import { translate } from '../utils/translation'

interface DaySummaryProps {
  child: Child
  date?: Moment
}

const getMeaningfulStartingDate = (date = moment()) => {
  // are we on the evening?
  if (date.hour() > 18) date = date.add('1', 'day')
  // are we on the weekend
  if (date.isoWeekday() > 5) date = date.add(5, 'days').startOf('isoWeek')
  return date
}

export const DaySummary = ({ child, date = moment() }: DaySummaryProps) => {
  const styles = useStyleSheet(themedStyles)
  const displayDate = getMeaningfulStartingDate(date)
  const [week, year] = [displayDate.isoWeek(), displayDate.isoWeekYear()]
  const { data: weekLessons } = useTimetable(
    child,
    week,
    year,
    LanguageService.getLanguageCode()
  )

  const lessons = weekLessons
    .filter((lesson) => lesson.dayOfWeek === displayDate.isoWeekday())
    .sort((a, b) => a.dateStart.localeCompare(b.dateStart))

  if (lessons.length <= 0) {
    return null
  }

  const gymBag = lessons.some((lesson) => lesson.code === 'IDH')

  return (
    <View>
      <Text category="c2" style={styles.heading}>
        {displayDate.format('dddd') + ' ' + displayDate.format('ll')}
      </Text>
      <View style={styles.summary}>
        <View style={styles.part}>
          <View>
            <Text category="c2" style={styles.label}>
              {translate('schedule.start')}
            </Text>
            <Text category="h5">{lessons[0].timeStart.slice(0, 5)} - </Text>
          </View>
        </View>
        <View style={styles.part}>
          <View>
            <Text category="c2" style={styles.label}>
              {translate('schedule.end')}
            </Text>
            <Text category="h5">
              {lessons[lessons.length - 1].timeEnd.slice(0, 5)}
            </Text>
          </View>
        </View>
        <View style={styles.part}>
          <View>
            <Text category="c2" style={styles.label}>
              &nbsp;
            </Text>
            <Text category="s2">
              {gymBag
                ? ` 🤼‍♀️ ${translate('schedule.gymBag', {
                    defaultValue: 'Gympapåse',
                  })}`
                : ''}
            </Text>
          </View>
        </View>
      </View>

      <Text category="s2">
        {gymBag
          ? ` 🤼‍♀️ ${translate('schedule.gymBag', {
              defaultValue: 'Gympapåse',
            })}`
          : ''}
      </Text>
    </View>
  )
}

const themedStyles = StyleService.create({
  part: {
    flexDirection: 'column',
  },
  summary: {
    flexDirection: 'row',
  },
  label: {
    marginTop: 10,
  },
  heading: {
    marginBottom: -10,
  },
})
