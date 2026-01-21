'use client'

import { useState } from 'react'
import Calendar from 'react-calendar'

type CalendarValue = Date | [Date, Date] | [Date | null, Date | null] | null
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import 'react-calendar/dist/Calendar.css'

interface Event {
  id: string
  event_id: string
  title: string
  event_date: string
  event_time: string | null
  category: string | null
  location: string | null
  is_online: boolean
  price: number
  registration_required: boolean
}

interface EventCalendarProps {
  events: Event[]
  onDateClick?: (date: Date) => void
}

export function EventCalendar({ events, onDateClick }: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = events.filter((event) => {
        const eventDate = parseISO(event.event_date)
        return isSameDay(eventDate, date)
      })

      if (dayEvents.length > 0) {
        return (
          <div className="mt-1 flex flex-wrap gap-0.5 justify-center">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
                title={event.title}
              />
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[8px] text-amber-400 font-semibold">
                +{dayEvents.length - 2}
              </div>
            )}
          </div>
        )
      }
    }
    return null
  }

  const handleDateChange = (value: CalendarValue) => {
    const dateValue = Array.isArray(value) ? value[0] : value
    if (dateValue instanceof Date) {
      setSelectedDate(dateValue)
      if (onDateClick) {
        onDateClick(dateValue)
      }
    }
  }

  // Get events for selected date
  const selectedDateEvents = events.filter((event) => {
    const eventDate = parseISO(event.event_date)
    return isSameDay(eventDate, selectedDate)
  })

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4">
        <style jsx global>{`
          .react-calendar {
            width: 100%;
            background: transparent;
            border: none;
            font-family: inherit;
          }
          .react-calendar__navigation {
            display: flex;
            height: 44px;
            margin-bottom: 1em;
          }
          .react-calendar__navigation button {
            min-width: 44px;
            background: transparent;
            color: rgb(226 232 240);
            font-size: 16px;
            font-weight: 600;
          }
          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
          }
          .react-calendar__navigation button[disabled] {
            opacity: 0.5;
          }
          .react-calendar__month-view__weekdays {
            text-align: center;
            text-transform: uppercase;
            font-weight: 600;
            font-size: 0.75em;
            color: rgb(148 163 184);
            margin-bottom: 0.5em;
          }
          .react-calendar__month-view__weekdays__weekday {
            padding: 0.5em;
          }
          .react-calendar__month-view__days__day {
            color: rgb(226 232 240);
          }
          .react-calendar__month-view__days__day--weekend {
            color: rgb(203 213 225);
          }
          .react-calendar__month-view__days__day--neighboringMonth {
            color: rgb(100 116 139);
          }
          .react-calendar__tile {
            max-width: 100%;
            padding: 10px 6.6667px;
            background: transparent;
            text-align: center;
            line-height: 16px;
            font-size: 0.833em;
            border-radius: 8px;
            min-height: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            background: rgba(255, 255, 255, 0.1);
          }
          .react-calendar__tile--now {
            background: rgba(251, 191, 36, 0.2);
            border: 1px solid rgba(251, 191, 36, 0.4);
          }
          .react-calendar__tile--active {
            background: rgba(251, 191, 36, 0.3);
            border: 1px solid rgba(251, 191, 36, 0.6);
          }
          .react-calendar__tile--hasActive {
            background: rgba(251, 191, 36, 0.2);
          }
        `}</style>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          className="w-full"
        />
      </div>

      {selectedDateEvents.length > 0 && (
        <Card className="bg-slate-900/80 border border-white/10">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">
            Events on {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <div className="space-y-3">
            {selectedDateEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.event_id}`}
                className="block p-3 rounded-lg border border-white/10 hover:border-amber-400/60 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-50 mb-1">{event.title}</h4>
                    <div className="text-sm text-slate-300 space-y-1">
                      {event.event_time && (
                        <div>⏰ {event.event_time.substring(0, 5)}</div>
                      )}
                      {event.category && (
                        <div className="text-xs text-amber-200/90 uppercase">
                          {event.category}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    {event.price > 0 ? (
                      <div>${event.price.toFixed(2)}</div>
                    ) : (
                      <div className="text-green-400">Free</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
