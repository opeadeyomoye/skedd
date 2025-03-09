import { auth, calendar_v3 } from '@googleapis/calendar'
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
  calendarId: z.string(),
  timeMin: z.string().optional(),
  timeMax: z.string().optional(),
})

const CreateEventArgumentsSchema = z.object({
  calendarId: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  start: z.string(),
  end: z.string(),
  attendees: z.array(z.object({
    email: z.string()
  })).optional(),
  location: z.string().optional(),
})

const UpdateEventArgumentsSchema = z.object({
  calendarId: z.string(),
  eventId: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  attendees: z.array(z.object({
    email: z.string()
  })).optional(),
  location: z.string().optional(),
})

const DeleteEventArgumentsSchema = z.object({
  calendarId: z.string(),
  eventId: z.string(),
})

const prefix = 'calendar.google'

export const toolNamePrefix = prefix
export const toolDefinitions = {
  [`${prefix}.list-calendars`]: {
    name: `${prefix}.list-calendars`,
    description: 'List all available calendars',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  [`${prefix}.list-events`]: {
    name: `${prefix}.list-events`,
    description: 'List events from a calendar',
    parameters: {
      type: 'object',
      properties: {
        calendarId: {
          type: 'string',
          description: 'ID of the calendar to list events from',
        },
        timeMin: {
          type: 'string',
          description: 'Start time in ISO format',
        },
        timeMax: {
          type: 'string',
          description: 'End time in ISO format',
        },
      },
      required: ['calendarId', 'timeMin', 'timeMax'],
    },
  },
  [`${prefix}.create-event`]: {
    name: `${prefix}.create-event`,
    description: 'Create a new calendar event',
    parameters: {
      type: 'object',
      properties: {
        calendarId: {
          type: 'string',
          description: 'ID of the calendar to create event in',
        },
        summary: {
          type: 'string',
          description: 'Title of the event',
        },
        description: {
          type: 'string',
          description: 'Description of the event',
        },
        start: {
          type: 'string',
          description: 'Start time in ISO format',
        },
        end: {
          type: 'string',
          description: 'End time in ISO format',
        },
        location: {
          type: 'string',
          description: 'Location of the event',
        },
        attendees: {
          type: 'array',
          description: 'List of attendees',
          items: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                description: 'Email address of the attendee'
              }
            },
            required: ['email']
          }
        }
      },
      required: ['calendarId', 'summary', 'start', 'end'],
    },
  },
  [`${prefix}.update-event`]: {
    name: `${prefix}.update-event`,
    description: 'Update an existing calendar event. Useful for rescheduling calendar events or changing some of their details.',
    parameters: {
      type: 'object',
      properties: {
        calendarId: {
          type: 'string',
          description: 'ID of the calendar containing the event',
        },
        eventId: {
          type: 'string',
          description: 'ID of the event to update',
        },
        summary: {
          type: 'string',
          description: 'New title of the event',
        },
        description: {
          type: 'string',
          description: 'New description of the event',
        },
        start: {
          type: 'string',
          description: 'New start time in ISO format',
        },
        end: {
          type: 'string',
          description: 'New end time in ISO format',
        },
        location: {
          type: 'string',
          description: 'New location of the event',
        },
        attendees: {
          type: 'array',
          description: 'List of attendees',
          items: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                description: 'Email address of the attendee'
              }
            },
            required: ['email']
          }
        }
      },
      required: ['calendarId', 'eventId'],
    },
  },
  [`${prefix}.delete-event`]: {
    name: `${prefix}.delete-event`,
    description: 'Delete a calendar event',
    parameters: {
      type: 'object',
      properties: {
        calendarId: {
          type: 'string',
          description: 'ID of the calendar containing the event',
        },
        eventId: {
          type: 'string',
          description: 'ID of the event to delete',
        },
      },
      required: ['calendarId', 'eventId'],
    },
  },
} as const


export async function callTool<T extends ToolName>(
  accessToken: string,
  name: T,
  args: ToolArguments<T>
) {
  const calendar = new calendar_v3.Calendar({
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  })

  try {
    switch (name) {
      case 'calendar.google.list-calendars': {
        const response = await calendar.calendarList.list()
        const calendars = response.data.items || []
        return {
          content: [{
            type: 'text',
            text: calendars.map((cal: CalendarListEntry) =>
              `${cal.summary || 'Untitled'} (calendar-id: ${cal.id || 'no-id'})`).join('\n')
          }]
        }
      }

      case 'calendar.google.list-events': {
        const validArgs = ListEventsArgumentsSchema.parse(args)
        const response = await calendar.events.list({
          calendarId: validArgs.calendarId,
          timeMin: validArgs.timeMin,
          timeMax: validArgs.timeMax,
          singleEvents: true,
          orderBy: 'startTime',
        })

        const events = response.data.items || []
        return {
          content: [{
            type: 'text',
            text: events.map((event: CalendarEvent) => {
              const attendeeList = event.attendees
                ? `\nAttendees: ${event.attendees.map((a: CalendarEventAttendee) =>
                  `${a.email || 'no-email'} (responseStatus: ${a.responseStatus || 'unknown'})`).join(', ')}`
                : ''
              const locationInfo = event.location ? `\nLocation: ${event.location}` : ''
              return `${event.summary || 'Untitled'} (event-id: ${event.id || 'no-id'})${locationInfo}\nStart: ${event.start?.dateTime || event.start?.date || 'unspecified'}\nEnd: ${event.end?.dateTime || event.end?.date || 'unspecified'}${attendeeList}\n`
            }).join('\n')
          }]
        }
      }

      case 'calendar.google.create-event': {
        const validArgs = CreateEventArgumentsSchema.parse(args)
        const event = await calendar.events.insert({
          calendarId: validArgs.calendarId,
          requestBody: {
            summary: validArgs.summary,
            description: validArgs.description,
            start: { dateTime: validArgs.start },
            end: { dateTime: validArgs.end },
            attendees: validArgs.attendees,
            location: validArgs.location,
          },
        }).then(response => response.data)

        return {
          content: [{
            type: 'text',
            text: `Event created: ${event.summary} (event-id: ${event.id})`
          }]
        }
      }

      case 'calendar.google.update-event': {
        const validArgs = UpdateEventArgumentsSchema.parse(args)
        const event = await calendar.events.patch({
          calendarId: validArgs.calendarId,
          eventId: validArgs.eventId,
          requestBody: {
            summary: validArgs.summary,
            description: validArgs.description,
            start: validArgs.start ? { dateTime: validArgs.start } : undefined,
            end: validArgs.end ? { dateTime: validArgs.end } : undefined,
            attendees: validArgs.attendees,
            location: validArgs.location,
          },
        }).then(response => response.data)

        return {
          content: [{
            type: 'text',
            text: `Event updated: ${event.summary} (event-id: ${event.id})`
          }]
        }
      }

      case 'calendar.google.delete-event': {
        const validArgs = DeleteEventArgumentsSchema.parse(args)
        await calendar.events.delete({
          calendarId: validArgs.calendarId,
          eventId: validArgs.eventId,
        })

        return {
          content: [{
            type: 'text',
            text: `Event deleted successfully`
          }]
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    console.error('Error processing request:', error)
    throw error
  }
}

type ToolDefinitions = typeof toolDefinitions
export type ToolName = keyof ToolDefinitions
export type ToolArguments<T extends ToolName> = RequiredToolArguments<T> & OptionalToolArguments<T>
type RequiredToolArguments<T extends ToolName> = {
  [K in ToolDefinitions[T]['parameters']['required'][number]]: unknown
}
type OptionalToolArguments<T extends ToolName> = Omit<
  {
    -readonly[K in keyof ToolDefinitions[T]['parameters']['properties']]?: unknown
  },
  keyof RequiredToolArguments<T>
>
