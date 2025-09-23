// File: lib/openai.ts
import { OpenAI } from 'openai';
import { googleCalendarService } from '@/lib/google-calendar';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ProcessedVoiceNote {
  category: string;
  content: string;
  item_type: 'reminder' | 'task' | 'note' | 'contact_action' | 'calendar_event';
  due_date?: string; // ISO string if applicable
  confidence: number; // 0-1 confidence score
  calendar_event?: {
    summary: string;
    description?: string;
    start_time: string; // ISO string
    end_time: string; // ISO string
    duration_minutes?: number;
  };
}

export interface ProcessedVoiceNoteResponse {
  items: ProcessedVoiceNote[];
}

export async function processVoiceNote(
  transcript: string, 
  existingCategories: string[] = [],
  currentDate: string = new Date().toISOString(),
  userTimezone: string = 'America/New_York',
  userId?: string
): Promise<ProcessedVoiceNote[]> {
  const categoryList = existingCategories.length > 0 
    ? `Existing categories: ${existingCategories.join(', ')}`
    : 'No existing categories - you can create new ones';

  const now = new Date(currentDate);
  const userLocalTime = now.toLocaleString('en-US', { 
    timeZone: userTimezone,
    dateStyle: 'full',
    timeStyle: 'long'
  });

  const systemPrompt = `You are an AI assistant that categorizes voice notes into actionable items and detects calendar events. 

Current date and time in user's timezone (${userTimezone}): ${userLocalTime}
Current UTC time: ${currentDate}

IMPORTANT INSTRUCTIONS:
1. IDENTIFY ALL SEPARATE TASKS/ITEMS in the voice note - users often mention multiple things
2. CREATE SEPARATE ENTRIES for each distinct task/reminder/item
3. CATEGORIZE APPROPRIATELY - be specific and logical with categories
4. DETECT CALENDAR EVENTS - look for phrases like "put in my calendar", "schedule", "meeting", "appointment", etc.

CALENDAR EVENT DETECTION:
- Look for phrases indicating calendar creation: "put in my calendar", "schedule", "meeting with", "appointment", "remind me to meet", etc.
- Extract event details: title/summary, date, time, duration
- If user says "meeting with boss tomorrow at 9:30am", extract this as a calendar event
- Default meeting duration is 60 minutes unless specified
- For calendar events, set item_type as "calendar_event"

TIMEZONE RULES:
- When user mentions times like "3pm", "tomorrow at 3pm", etc., they mean LOCAL TIME in ${userTimezone}
- Convert all times to UTC for storage
- For example: if user says "3pm" and they're in Eastern Time, store as 19:00:00Z (3pm + 4 hours for EDT)

CATEGORIZATION RULES:
- Doctor/medical appointments → "Health" or "Medical"
- Shopping items → "Shopping" or "Groceries"
- Work-related → "Work" or specific work category
- Family calls → "Family"
- General appointments → "Appointments"
- Bills/payments → "Finance"
- Personal care → "Personal"
- Calendar events → "Appointments" or relevant category
- PREFER existing categories when appropriate, but CREATE NEW SPECIFIC ones when needed

${categoryList}

Analyze the user's voice note and extract ALL separate actionable items:

For EACH separate task/item, determine:
1. An appropriate category name (prefer existing categories when suitable, create specific new ones when needed)
2. Clean, actionable content (just the specific task, not combined items)
3. Item type (reminder, task, note, contact_action, or calendar_event)
4. Due date if mentioned (return as ISO string in UTC, converted from user's local time)
5. If it's a calendar event, extract calendar_event details

Examples of CALENDAR EVENTS:
- "Put in my calendar tomorrow about meeting with my boss at 9:30am" = calendar_event
- "Schedule a doctor appointment for next Friday at 2pm" = calendar_event
- "Remind me to meet Sarah for lunch on Wednesday at noon" = calendar_event

Examples of MULTIPLE ITEMS:
- "Remind me to call mom tomorrow and put in my calendar meeting with boss at 3pm" = 2 items (1 reminder + 1 calendar_event)
- "Doctor appointment at 3pm and also pay bills" = 2 items
- "Buy milk, eggs, and bread" = 1 item (single shopping task)

Rules:
- ALWAYS look for multiple separate tasks
- Extract clear, actionable content for each item
- Use specific, logical categories
- For times: if no time specified but date is, assume 9:00 AM local time
- ALWAYS convert local times to UTC for storage
- For calendar events, calculate end time based on duration (default 60 minutes)

Respond with valid JSON only:
{
  "items": [
    {
      "category": "string",
      "content": "string", 
      "item_type": "reminder" | "task" | "note" | "contact_action" | "calendar_event",
      "due_date": "ISO string in UTC or null",
      "confidence": 0.0-1.0,
      "calendar_event": {
        "summary": "string",
        "description": "string (optional)",
        "start_time": "ISO string in UTC",
        "end_time": "ISO string in UTC",
        "duration_minutes": number
      } // Only include this field if item_type is "calendar_event"
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please process this voice note: "${transcript}"` }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const parsed = JSON.parse(response) as ProcessedVoiceNoteResponse;
    
    // Validate the response structure
    if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      throw new Error('Invalid response structure from OpenAI - no items array');
    }

    // Validate and fix each item
    const validatedItems: ProcessedVoiceNote[] = [];
    
    for (const item of parsed.items) {
      if (!item.category || !item.content || !item.item_type) {
        console.warn('Skipping invalid item:', item);
        continue;
      }

      // Validate and fix due_date if present
      if (item.due_date) {
        try {
          const parsedDate = new Date(item.due_date);
          if (isNaN(parsedDate.getTime())) {
            console.warn('Invalid date from OpenAI, removing due_date:', item.due_date);
            item.due_date = undefined;
          } else {
            // Ensure the date is reasonable (not too far in past/future)
            const now = new Date();
            const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            const oneYearFromNow = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
            
            if (parsedDate < oneMonthAgo) {
              console.warn('Due date is too far in the past, removing:', item.due_date);
              item.due_date = undefined;
            } else if (parsedDate > oneYearFromNow) {
              console.warn('Due date is too far in future, removing:', item.due_date);
              item.due_date = undefined;
            } else {
              // Date looks reasonable, keep as UTC
              item.due_date = parsedDate.toISOString();
            }
          }
        } catch (dateError) {
          console.warn('Error parsing due_date, removing:', item.due_date, dateError);
          item.due_date = undefined;
        }
      }

      // Validate calendar event details if present
      if (item.item_type === 'calendar_event' && item.calendar_event) {
        try {
          const startTime = new Date(item.calendar_event.start_time);
          const endTime = new Date(item.calendar_event.end_time);
          
          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            console.warn('Invalid calendar event times, converting to reminder:', item);
            item.item_type = 'reminder';
            delete item.calendar_event;
          } else if (startTime >= endTime) {
            console.warn('Calendar event end time before start time, fixing:', item);
            // Fix end time to be 1 hour after start time
            endTime.setTime(startTime.getTime() + (60 * 60 * 1000));
            item.calendar_event.end_time = endTime.toISOString();
            item.calendar_event.duration_minutes = 60;
          }
        } catch (calendarError) {
          console.warn('Error validating calendar event, converting to reminder:', calendarError);
          item.item_type = 'reminder';
          delete item.calendar_event;
        }
      }

      validatedItems.push(item);
    }

    if (validatedItems.length === 0) {
      throw new Error('No valid items after validation');
    }

    // Create calendar events if user has Google Calendar connected
    if (userId) {
      for (const item of validatedItems) {
        if (item.item_type === 'calendar_event' && item.calendar_event) {
          try {
            const isConnected = await googleCalendarService.isCalendarConnected(userId);
            if (isConnected) {
              const tokens = await googleCalendarService.getUserTokens(userId);
              if (tokens) {
                await googleCalendarService.createEvent(tokens, {
                  summary: item.calendar_event.summary,
                  description: item.calendar_event.description || item.content,
                  startDateTime: item.calendar_event.start_time,
                  endDateTime: item.calendar_event.end_time,
                  timeZone: userTimezone
                });
                console.log('Successfully created calendar event:', item.calendar_event.summary);
              }
            } else {
              console.log('Google Calendar not connected, skipping event creation');
            }
          } catch (calendarError) {
            console.error('Error creating calendar event:', calendarError);
            // Don't fail the whole process if calendar creation fails
          }
        }
      }
    }

    return validatedItems;
  } catch (error) {
    console.error('Error processing voice note with OpenAI:', error);
    
    // Fallback processing if OpenAI fails
    return [{
      category: 'General',
      content: transcript,
      item_type: 'note',
      confidence: 0.1
    }];
  }
}