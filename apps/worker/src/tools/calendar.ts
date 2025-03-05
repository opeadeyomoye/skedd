import google from 'googleapis'
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
          description: 'Start time in ISO format (optional)',
        },
        timeMax: {
          type: 'string',
          description: 'End time in ISO format (optional)',
        },
      },
      required: ['calendarId'],
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
    description: 'Update an existing calendar event',
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

export function callTool<T extends ToolName>(name: T, args: ToolArguments<T>) {
  //
}

type ToolDefinitions = typeof toolDefinitions
type ToolName = keyof ToolDefinitions
type ToolArguments<T extends ToolName> = RequiredToolArguments<T> & OptionalToolArugments<T>
type RequiredToolArguments<T extends ToolName> = {
  [K in ToolDefinitions[T]['parameters']['required'][number]]: unknown
}
type OptionalToolArugments<T extends ToolName> = Omit<
  {
    -readonly[K in keyof ToolDefinitions[T]['parameters']['properties']]?: unknown
  },
  keyof RequiredToolArguments<T>
>
