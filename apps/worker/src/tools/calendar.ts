import { calendar_v3 } from '@googleapis/calendar'
import { tool } from 'ai'
import { z } from 'zod'

interface CalendarListEntry {
  id?: string | null
  summary?: string | null
}

interface CalendarEvent {
  id?: string | null
  summary?: string | null
  start?: { dateTime?: string | null, date?: string | null }
  end?: { dateTime?: string | null, date?: string | null }
  location?: string | null
  attendees?: CalendarEventAttendee[] | null
}

interface CalendarEventAttendee {
  email?: string | null
  responseStatus?: string | null
}

// Define Zod schemas for validation
const ListEventsArgumentsSchema = z.object({
  calendarId: z.string()
    .describe('ID of the calendar to list events from. Defaults to "primary".')
    .default('primary'),
  timeMin: z.string()
    .describe('Start time in ISO format')
    .optional(),
  timeMax: z.string()
    .describe('End time in ISO format')
    .optional(),
})

const CreateEventArgumentsSchema = z.object({
  calendarId: z.string()
    .describe('ID of the calendar to create event in')
    .default('primary'),
  summary: z.string()
    .describe('Title of the event'),
  description: z.string()
    .describe('Description of the event')
    .optional(),
  start: z.string()
    .describe('Start time in ISO format'),
  end: z.string()
    .describe('End time in ISO format'),
  attendees: z.array(z.object({
    email: z.string()
      .describe('Email address of the attendee')
  }))
    .describe('List of attendees')
    .optional(),
  location: z.string()
    .describe('Location of the event')
    .optional(),
})

const UpdateEventArgumentsSchema = z.object({
  calendarId: z.string()
    .describe('ID of the calendar containing the event')
    .default('primary'),
  eventId: z.string()
    .describe('ID of the event to update'),
  summary: z.string()
    .describe('New title of the event')
    .optional(),
  description: z.string()
    .describe('New description of the event')
    .optional(),
  start: z.string()
    .describe('New start time in ISO format')
    .optional(),
  end: z.string()
    .describe('New end time in ISO format')
    .optional(),
  attendees: z.array(z.object({
    email: z.string()
      .describe('Email address of the attendee')
  }))
    .describe('List of attendees')
    .optional(),
  location: z.string()
    .describe('New location of the event')
    .optional(),
})

const DeleteEventArgumentsSchema = z.object({
  calendarId: z.string()
    .describe('ID of the calendar containing the event')
    .default('primary'),
  eventId: z.string()
    .describe('ID of the event to delete'),
})


export function getToolDefinitions(accessToken: string) {
  const calendar = new calendar_v3.Calendar({
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  })

  return {
    list_events: tool({
      parameters: ListEventsArgumentsSchema,
      description: 'List events from the user\'s calendar',
      execute: async (args) => {
        const response = await calendar.events.list({
          calendarId: args.calendarId,
          timeMin: args.timeMin,
          timeMax: args.timeMax,
          singleEvents: true,
          orderBy: 'startTime',
        })
        const status = (str?: string | null) => {
          switch (str) {
            case 'needsAction':
              return 'no response yet'
            default:
              return str || 'unknown'
          }
        }

        const events = response.data.items || []
        return {
          content: [{
            type: 'text',
            text: events.map((event) => {
              const attendeeList = event.attendees
                ? `\nAttendees: ${event.attendees.map((a: CalendarEventAttendee) =>
                  `${a.email || 'no-email'} (${status(a.responseStatus)})`).join(', ')}`
                : ''
              const locationInfo = event.location ? `\nLocation: ${event.location}` : ''
              return `${event.summary || 'Untitled'} (event-id: ${event.id || 'no-id'})${locationInfo}\nStart: ${event.start?.dateTime || event.start?.date || 'unspecified'}\nEnd: ${event.end?.dateTime || event.end?.date || 'unspecified'}${attendeeList}\n`
            }).join('\n')
          }]
        }
      }
    }),
    create_event: tool({
      parameters: CreateEventArgumentsSchema,
      description: 'Create a new calendar event for the user',
      execute: async (args) => {
        const event = await calendar.events.insert({
          calendarId: args.calendarId,
          requestBody: {
            summary: args.summary,
            description: args.description,
            start: { dateTime: args.start },
            end: { dateTime: args.end },
            attendees: args.attendees,
            location: args.location,
          },
        }).then(response => response.data)

        return {
          content: [{
            type: 'text',
            text: `Event created: ${event.summary} (event-id: ${event.id})`
          }]
        }
      }
    }),
    update_event: tool({
      parameters: UpdateEventArgumentsSchema,
      description: 'Update an existing calendar event for the user',
      execute: async (args) => {
        const event = await calendar.events.patch({
          calendarId: args.calendarId,
          eventId: args.eventId,
          requestBody: {
            summary: args.summary,
            description: args.description,
            start: args.start ? { dateTime: args.start } : undefined,
            end: args.end ? { dateTime: args.end } : undefined,
            attendees: args.attendees,
            location: args.location,
          },
        }).then(response => response.data)

        return {
          content: [{
            type: 'text',
            text: `Event updated: ${event.summary} (event-id: ${event.id})`
          }]
        }
      }
    }),
    delete_event: tool({
      parameters: DeleteEventArgumentsSchema,
      description: 'Delete a calendar event',
      execute: async (args) => {
        await calendar.events.delete({
          calendarId: args.calendarId,
          eventId: args.eventId,
        })

        return {
          content: [{
            type: 'text',
            text: `Event deleted successfully`
          }]
        }
      }
    }),
  }
}
